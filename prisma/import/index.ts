import path from 'path';
import {
  UserRole,
  Gender,
  ContactModeType,
  InterestSlug,
  ReferrerType,
  ProjectType,
  SubmissionStatus,
  ProjectApprovalStatus,
  ProjectOperationStatus,
  DonationType,
  DonationReceiptStatus,
  ProjectFrequency,
  VolunteerProjectPositionStatus,
} from '@prisma/client';
import { prisma } from '../../src/prisma/client';
import { hashPassword } from '../../src/utils/password';
import { hasColumns, readCsv } from './csv';
import { isEmpty, splitPipe, toBoolean, toDate, toOptional } from './helpers';
import { getOrCreateStage, pushIssue, writeReport } from './report';
import { ImportContext, ImportReport, RowIssue } from './types';

type CliArgs = {
  dir: string;
  dryRun: boolean;
};

const USER_ROLES = new Set<UserRole>([
  'superAdmin',
  'subAdmin',
  'generalManager',
  'financeManager',
  'partner',
]);

const GENDERS = new Set<Gender>(['male', 'female', 'others']);
const CONTACT_MODES = new Set<ContactModeType>([
  'email',
  'whatsapp',
  'telegram',
  'messenger',
  'phoneCall',
]);
const INTERESTS = new Set<InterestSlug>([
  'fundraise',
  'planTrips',
  'missionTrips',
  'longTerm',
  'admin',
  'publicity',
  'teaching',
  'training',
  'agriculture',
  'building',
  'others',
]);
const REFERRERS = new Set<ReferrerType>([
  'friend',
  'socialMedia',
  'church',
  'website',
  'event',
  'other',
]);
const PROJECT_TYPES = new Set<ProjectType>(['brick', 'sponsor', 'partnerLed']);
const SUBMISSION_STATUSES = new Set<SubmissionStatus>([
  'draft',
  'submitted',
  'withdrawn',
]);
const PROJECT_APPROVAL_STATUSES = new Set<ProjectApprovalStatus>([
  'pending',
  'reviewing',
  'approved',
  'rejected',
]);
const PROJECT_OPERATION_STATUSES = new Set<ProjectOperationStatus>([
  'ongoing',
  'paused',
  'cancelled',
  'completed',
  'notStarted',
]);
const DONATION_TYPES = new Set<DonationType>([
  'individual',
  'fundraising',
  'corporate',
]);
const DONATION_RECEIPT_STATUSES = new Set<DonationReceiptStatus>([
  'pending',
  'received',
  'cancelled',
]);
const PROJECT_FREQUENCIES = new Set<ProjectFrequency>([
  'once',
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);
const VOLUNTEER_POSITION_STATUSES = new Set<VolunteerProjectPositionStatus>([
  'reviewing',
  'approved',
  'rejected',
  'active',
  'inactive',
]);

const resolveEnumValue = <T extends string>(
  value: string | undefined,
  allowed: Set<T>,
): T | undefined => {
  const normalized = toOptional(value)?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  for (const candidate of allowed) {
    if (candidate.toLowerCase() === normalized) {
      return candidate;
    }
  }

  return undefined;
};

const resolvePipeEnumValues = <T extends string>(
  value: string | undefined,
  allowed: Set<T>,
): { values: T[]; invalid?: string } => {
  const rawValues = splitPipe(value);
  const values: T[] = [];

  for (const rawValue of rawValues) {
    const resolved = resolveEnumValue(rawValue, allowed);
    if (!resolved) {
      return { values: [], invalid: rawValue };
    }
    values.push(resolved);
  }

  return { values };
};

const toNullable = (value: string | undefined): string | null => {
  const optional = toOptional(value);
  return optional ?? null;
};

const toDecimalString = (value: string | undefined): string | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }

  const normalized = value.trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return normalized;
};

const parseArgs = (): CliArgs => {
  const args = process.argv.slice(2);
  const dirIndex = args.findIndex((arg) => arg === '--dir');
  const dryRun = args.includes('--dry-run');

  const dir =
    dirIndex >= 0 && args[dirIndex + 1]
      ? args[dirIndex + 1]
      : 'docs/data-import/templates';

  return {
    dir: path.resolve(process.cwd(), dir),
    dryRun,
  };
};

const makeIssue = (
  stage: string,
  rowNumber: number,
  code: RowIssue['code'],
  message: string,
  field?: string,
  externalId?: string,
): RowIssue => ({
  stage,
  rowNumber,
  code,
  message,
  field,
  externalId,
});

const isDuplicateExternalId = (
  seenExternalIds: Set<string>,
  stage: string,
  rowNumber: number,
  externalId: string,
  report: ImportReport,
): boolean => {
  if (seenExternalIds.has(externalId)) {
    pushIssue(
      report,
      makeIssue(
        stage,
        rowNumber,
        'DUPLICATE_EXTERNAL_ID',
        `Duplicate external_id: ${externalId}`,
        'external_id',
        externalId,
      ),
    );
    return true;
  }

  seenExternalIds.add(externalId);
  return false;
};

const importUsers = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'users');
  const filePath = path.join(dir, 'users.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'first_name',
    'last_name',
    'email',
    'password_plain',
    'password_hash',
    'title',
    'role',
    'is_active',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'users',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const firstName = row.first_name;
    const lastName = row.last_name;
    const email = row.email;
    const passwordPlain = row.password_plain;
    const passwordHashRaw = row.password_hash;
    const title = toOptional(row.title);
    const roleRaw = toOptional(row.role);
    const isActiveRaw = toOptional(row.is_active);

    if (isEmpty(externalId)) {
      pushIssue(
        report,
        makeIssue(
          'users',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id is required',
          'external_id',
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'users',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email)) {
      pushIssue(
        report,
        makeIssue(
          'users',
          rowNumber,
          'MISSING_REQUIRED',
          'first_name, last_name and email are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (isEmpty(passwordPlain) && isEmpty(passwordHashRaw)) {
      pushIssue(
        report,
        makeIssue(
          'users',
          rowNumber,
          'MISSING_REQUIRED',
          'Either password_plain or password_hash must be provided',
          'password_plain',
          externalId,
        ),
      );
      continue;
    }

    let role: UserRole | undefined;
    if (roleRaw) {
      const resolvedRole = resolveEnumValue(roleRaw, USER_ROLES);
      if (!resolvedRole) {
        pushIssue(
          report,
          makeIssue(
            'users',
            rowNumber,
            'INVALID_ENUM',
            `Invalid role: ${roleRaw}`,
            'role',
            externalId,
          ),
        );
        continue;
      }
      role = resolvedRole;
    }

    let isActive: boolean | undefined;
    if (isActiveRaw) {
      isActive = toBoolean(isActiveRaw);
      if (isActive === undefined) {
        pushIssue(
          report,
          makeIssue(
            'users',
            rowNumber,
            'INVALID_BOOLEAN',
            `Invalid boolean for is_active: ${isActiveRaw}`,
            'is_active',
            externalId,
          ),
        );
        continue;
      }
    }

    if (context.dryRun) {
      const dryUserId = `dry-user-${externalId}`;
      context.userIdByExternalId.set(externalId, dryUserId);
      context.userIdByEmail.set(email, dryUserId);
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      const resolvedPasswordHash =
        passwordHashRaw || (await hashPassword(passwordPlain));

      if (!existing) {
        const created = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            passwordHash: resolvedPasswordHash,
            title,
            role: role ?? 'partner',
            isActive: isActive ?? true,
          },
          select: { id: true },
        });
        context.userIdByExternalId.set(externalId, created.id);
        context.userIdByEmail.set(email, created.id);
        stage.imported += 1;
      } else {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firstName,
            lastName,
            title,
            ...(role ? { role } : {}),
            ...(isActive !== undefined ? { isActive } : {}),
            ...(passwordPlain || passwordHashRaw
              ? { passwordHash: resolvedPasswordHash }
              : {}),
          },
        });
        context.userIdByExternalId.set(externalId, existing.id);
        context.userIdByEmail.set(email, existing.id);
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'users',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importPartners = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'partners');
  const filePath = path.join(dir, 'partners.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'user_external_id',
    'dob',
    'country_code',
    'contact_number',
    'emergency_country_code',
    'emergency_contact_number',
    'identification_number',
    'nationality',
    'occupation',
    'gender',
    'residential_address',
    'other_interests',
    'other_referrers',
    'other_contact_modes',
    'has_volunteer_experience',
    'volunteer_availability',
    'consent_updates_communications',
    'subscribe_newsletter_events',
    'skills',
    'languages',
    'contact_modes',
    'interests',
    'referrers',
    'trip_full_name',
    'trip_passport_number',
    'trip_passport_expiry',
    'trip_health_declaration',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'partners',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const userExternalId = row.user_external_id;

    if (isEmpty(externalId) || isEmpty(userExternalId)) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id and user_external_id are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'partners',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const userId = context.userIdByExternalId.get(userExternalId);
    if (!userId) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `User with external id ${userExternalId} not found in import run`,
          'user_external_id',
          externalId,
        ),
      );
      continue;
    }

    const requiredFields = [
      'country_code',
      'contact_number',
      'emergency_country_code',
      'emergency_contact_number',
      'identification_number',
      'nationality',
      'occupation',
      'gender',
      'volunteer_availability',
      'consent_updates_communications',
    ] as const;

    const missingField = requiredFields.find((field) => isEmpty(row[field]));
    if (missingField) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'MISSING_REQUIRED',
          `${missingField} is required`,
          missingField,
          externalId,
        ),
      );
      continue;
    }

    const gender = resolveEnumValue(row.gender, GENDERS);
    if (!gender) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_ENUM',
          `Invalid gender: ${row.gender}`,
          'gender',
          externalId,
        ),
      );
      continue;
    }

    const consentUpdatesCommunications = toBoolean(
      row.consent_updates_communications,
    );
    if (consentUpdatesCommunications === undefined) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_BOOLEAN',
          'consent_updates_communications must be true/false',
          'consent_updates_communications',
          externalId,
        ),
      );
      continue;
    }

    const hasVolunteerExperience = toBoolean(row.has_volunteer_experience);
    if (
      !isEmpty(row.has_volunteer_experience) &&
      hasVolunteerExperience === undefined
    ) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_BOOLEAN',
          'has_volunteer_experience must be true/false',
          'has_volunteer_experience',
          externalId,
        ),
      );
      continue;
    }

    const subscribeNewsletterEvents = toBoolean(
      row.subscribe_newsletter_events,
    );
    if (
      !isEmpty(row.subscribe_newsletter_events) &&
      subscribeNewsletterEvents === undefined
    ) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_BOOLEAN',
          'subscribe_newsletter_events must be true/false',
          'subscribe_newsletter_events',
          externalId,
        ),
      );
      continue;
    }

    const dob = toDate(row.dob);
    if (!isEmpty(row.dob) && !dob) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_DATE',
          `Invalid dob: ${row.dob}`,
          'dob',
          externalId,
        ),
      );
      continue;
    }

    const tripPassportExpiry = toDate(row.trip_passport_expiry);
    if (!isEmpty(row.trip_passport_expiry) && !tripPassportExpiry) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_DATE',
          `Invalid trip_passport_expiry: ${row.trip_passport_expiry}`,
          'trip_passport_expiry',
          externalId,
        ),
      );
      continue;
    }

    const contactModesResult = resolvePipeEnumValues(
      row.contact_modes,
      CONTACT_MODES,
    );
    if (contactModesResult.invalid) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_ENUM',
          `Invalid contact mode: ${contactModesResult.invalid}`,
          'contact_modes',
          externalId,
        ),
      );
      continue;
    }
    const contactModes = contactModesResult.values;

    const interestsResult = resolvePipeEnumValues(row.interests, INTERESTS);
    if (interestsResult.invalid) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_ENUM',
          `Invalid interest: ${interestsResult.invalid}`,
          'interests',
          externalId,
        ),
      );
      continue;
    }
    const interests = interestsResult.values;

    const referrersResult = resolvePipeEnumValues(row.referrers, REFERRERS);
    if (referrersResult.invalid) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'INVALID_ENUM',
          `Invalid referrer: ${referrersResult.invalid}`,
          'referrers',
          externalId,
        ),
      );
      continue;
    }
    const referrers = referrersResult.values;

    const tripFullName = toOptional(row.trip_full_name);
    const tripPassportNumber = toOptional(row.trip_passport_number);
    const tripComplete = Boolean(
      tripFullName || tripPassportNumber || tripPassportExpiry,
    );

    if (
      tripComplete &&
      (!tripFullName || !tripPassportNumber || !tripPassportExpiry)
    ) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'MISSING_REQUIRED',
          'trip_full_name, trip_passport_number and trip_passport_expiry are required together',
          'trip_full_name',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      context.partnerIdByExternalId.set(
        externalId,
        `dry-partner-${externalId}`,
      );
      stage.imported += 1;
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        const existingPartner = await tx.partner.findUnique({
          where: { userId },
          select: { id: true, tripFormId: true },
        });

        const partnerData = {
          dob,
          countryCode: row.country_code,
          contactNumber: row.contact_number,
          emergencyCountryCode: row.emergency_country_code,
          emergencyContactNumber: row.emergency_contact_number,
          identificationNumber: row.identification_number,
          nationality: row.nationality,
          occupation: row.occupation,
          gender,
          residentialAddress: toOptional(row.residential_address),
          otherInterests: toOptional(row.other_interests),
          otherReferrers: toOptional(row.other_referrers),
          otherContactModes: toOptional(row.other_contact_modes),
          hasVolunteerExperience: hasVolunteerExperience ?? false,
          volunteerAvailability: row.volunteer_availability,
          consentUpdatesCommunications,
          subscribeNewsletterEvents: subscribeNewsletterEvents ?? false,
        };

        let partnerId: string;
        if (!existingPartner) {
          const created = await tx.partner.create({
            data: {
              ...partnerData,
              user: { connect: { id: userId } },
            },
            select: { id: true },
          });
          partnerId = created.id;
          stage.imported += 1;
        } else {
          await tx.partner.update({
            where: { id: existingPartner.id },
            data: partnerData,
          });
          partnerId = existingPartner.id;
          stage.updated += 1;
        }

        await tx.partnerSkill.deleteMany({ where: { partnerId } });
        await tx.language.deleteMany({ where: { partnerId } });
        await tx.contactMode.deleteMany({ where: { partnerId } });
        await tx.interest.deleteMany({ where: { partnerId } });
        await tx.referrer.deleteMany({ where: { partnerId } });

        const skills = splitPipe(row.skills);
        const languages = splitPipe(row.languages);

        if (skills.length > 0) {
          await tx.partnerSkill.createMany({
            data: skills.map((skill) => ({ partnerId, skill })),
          });
        }

        if (languages.length > 0) {
          await tx.language.createMany({
            data: languages.map((language) => ({ partnerId, language })),
          });
        }

        if (contactModes.length > 0) {
          await tx.contactMode.createMany({
            data: contactModes.map((mode) => ({
              partnerId,
              mode: mode as ContactModeType,
            })),
          });
        }

        if (interests.length > 0) {
          await tx.interest.createMany({
            data: interests.map((interestSlug) => ({
              partnerId,
              interestSlug: interestSlug as InterestSlug,
            })),
          });
        }

        if (referrers.length > 0) {
          await tx.referrer.createMany({
            data: referrers.map((referrer) => ({
              partnerId,
              referrer: referrer as ReferrerType,
            })),
          });
        }

        if (
          tripComplete &&
          tripFullName &&
          tripPassportNumber &&
          tripPassportExpiry
        ) {
          const upsertedTrip = await tx.tripForm.upsert({
            where: { partnerId },
            update: {
              fullName: tripFullName,
              passportNumber: tripPassportNumber,
              passportExpiry: tripPassportExpiry,
              healthDeclaration: toOptional(row.trip_health_declaration),
            },
            create: {
              partnerId,
              fullName: tripFullName,
              passportNumber: tripPassportNumber,
              passportExpiry: tripPassportExpiry,
              healthDeclaration: toOptional(row.trip_health_declaration),
            },
            select: { id: true },
          });

          await tx.partner.update({
            where: { id: partnerId },
            data: { tripFormId: upsertedTrip.id },
          });
        } else {
          await tx.tripForm.deleteMany({ where: { partnerId } });
          await tx.partner.update({
            where: { id: partnerId },
            data: { tripFormId: null },
          });
        }

        context.partnerIdByExternalId.set(externalId, partnerId);
      });
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'partners',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importDonationProjects = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'donation_projects');
  const filePath = path.join(dir, 'donation_projects.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'managed_by_user_external_id',
    'title',
    'location',
    'about',
    'objectives',
    'beneficiaries',
    'initiator_name',
    'organising_team',
    'target_fund',
    'brick_size',
    'deadline',
    'type',
    'start_date',
    'end_date',
    'submission_status',
    'approval_status',
    'approval_notes',
    'image',
    'attachments',
    'operation_status',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'donation_projects',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const managerExternalId = row.managed_by_user_external_id;

    if (isEmpty(externalId) || isEmpty(managerExternalId)) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id and managed_by_user_external_id are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'donation_projects',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const managerId = context.userIdByExternalId.get(managerExternalId);
    if (!managerId) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Manager with external id ${managerExternalId} not found`,
          'managed_by_user_external_id',
          externalId,
        ),
      );
      continue;
    }

    const requiredFields = [
      'title',
      'location',
      'about',
      'objectives',
      'type',
      'start_date',
      'end_date',
    ] as const;

    const missingField = requiredFields.find((field) => isEmpty(row[field]));
    if (missingField) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'MISSING_REQUIRED',
          `${missingField} is required`,
          missingField,
          externalId,
        ),
      );
      continue;
    }

    const projectType = resolveEnumValue(row.type, PROJECT_TYPES);
    if (!projectType) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid type: ${row.type}`,
          'type',
          externalId,
        ),
      );
      continue;
    }

    const startDate = toDate(row.start_date);
    const endDate = toDate(row.end_date);
    const deadline = toDate(row.deadline);

    if (!startDate) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid start_date: ${row.start_date}`,
          'start_date',
          externalId,
        ),
      );
      continue;
    }

    if (!endDate) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid end_date: ${row.end_date}`,
          'end_date',
          externalId,
        ),
      );
      continue;
    }

    if (!isEmpty(row.deadline) && !deadline) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid deadline: ${row.deadline}`,
          'deadline',
          externalId,
        ),
      );
      continue;
    }

    const targetFund = toDecimalString(row.target_fund);
    if (!isEmpty(row.target_fund) && !targetFund) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'DB_ERROR',
          'target_fund must be numeric',
          'target_fund',
          externalId,
        ),
      );
      continue;
    }

    const brickSize = toDecimalString(row.brick_size);
    if (!isEmpty(row.brick_size) && !brickSize) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'DB_ERROR',
          'brick_size must be numeric',
          'brick_size',
          externalId,
        ),
      );
      continue;
    }

    const submissionStatusRaw = toOptional(row.submission_status);
    const approvalStatusRaw = toOptional(row.approval_status);
    const operationStatusRaw = toOptional(row.operation_status);

    if (
      submissionStatusRaw &&
      !resolveEnumValue(submissionStatusRaw, SUBMISSION_STATUSES)
    ) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid submission_status: ${submissionStatusRaw}`,
          'submission_status',
          externalId,
        ),
      );
      continue;
    }

    if (
      approvalStatusRaw &&
      !resolveEnumValue(approvalStatusRaw, PROJECT_APPROVAL_STATUSES)
    ) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid approval_status: ${approvalStatusRaw}`,
          'approval_status',
          externalId,
        ),
      );
      continue;
    }

    if (
      operationStatusRaw &&
      !resolveEnumValue(operationStatusRaw, PROJECT_OPERATION_STATUSES)
    ) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid operation_status: ${operationStatusRaw}`,
          'operation_status',
          externalId,
        ),
      );
      continue;
    }

    let submissionStatus =
      resolveEnumValue(submissionStatusRaw, SUBMISSION_STATUSES) ?? 'draft';
    let approvalStatus =
      resolveEnumValue(approvalStatusRaw, PROJECT_APPROVAL_STATUSES) ??
      'pending';
    let operationStatus =
      resolveEnumValue(operationStatusRaw, PROJECT_OPERATION_STATUSES) ??
      'notStarted';

    if (submissionStatus === 'submitted') {
      approvalStatus = 'pending';
      operationStatus = 'notStarted';
    }

    if (context.dryRun) {
      context.donationProjectIdByExternalId.set(
        externalId,
        `dry-don-project-${externalId}`,
      );
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.donationProject.findFirst({
        where: {
          managedBy: managerId,
          title: row.title,
          startDate,
          endDate,
        },
        select: { id: true },
      });

      if (!existing) {
        const created = await prisma.donationProject.create({
          data: {
            managedBy: managerId,
            title: row.title,
            location: row.location,
            about: row.about,
            objectives: row.objectives,
            beneficiaries: toNullable(row.beneficiaries),
            initiatorName: toNullable(row.initiator_name),
            organisingTeam: toNullable(row.organising_team),
            targetFund: targetFund ?? null,
            brickSize: brickSize ?? null,
            deadline: deadline ?? null,
            type: projectType,
            startDate,
            endDate,
            submissionStatus,
            approvalStatus,
            approvalNotes: toNullable(row.approval_notes),
            image: toNullable(row.image),
            attachments: toNullable(row.attachments),
            operationStatus,
          },
          select: { id: true },
        });

        context.donationProjectIdByExternalId.set(externalId, created.id);
        stage.imported += 1;
      } else {
        await prisma.donationProject.update({
          where: { id: existing.id },
          data: {
            managedBy: managerId,
            title: row.title,
            location: row.location,
            about: row.about,
            objectives: row.objectives,
            beneficiaries: toNullable(row.beneficiaries),
            initiatorName: toNullable(row.initiator_name),
            organisingTeam: toNullable(row.organising_team),
            targetFund: targetFund ?? null,
            brickSize: brickSize ?? null,
            deadline: deadline ?? null,
            type: projectType,
            startDate,
            endDate,
            submissionStatus,
            approvalStatus,
            approvalNotes: toNullable(row.approval_notes),
            image: toNullable(row.image),
            attachments: toNullable(row.attachments),
            operationStatus,
          },
        });

        context.donationProjectIdByExternalId.set(externalId, existing.id);
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'donation_projects',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importDonationProjectObjectives = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(
    report.summaries,
    'donation_project_objectives',
  );
  const filePath = path.join(dir, 'donation_project_objectives.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'donation_project_external_id',
    'objective',
    'order',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'donation_project_objectives',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const projectExternalId = row.donation_project_external_id;

    if (
      isEmpty(externalId) ||
      isEmpty(projectExternalId) ||
      isEmpty(row.objective) ||
      isEmpty(row.order)
    ) {
      pushIssue(
        report,
        makeIssue(
          'donation_project_objectives',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, donation_project_external_id, objective, order are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'donation_project_objectives',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const projectId =
      context.donationProjectIdByExternalId.get(projectExternalId);
    if (!projectId) {
      pushIssue(
        report,
        makeIssue(
          'donation_project_objectives',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Donation project with external id ${projectExternalId} not found`,
          'donation_project_external_id',
          externalId,
        ),
      );
      continue;
    }

    const order = Number(row.order);
    if (!Number.isInteger(order) || order <= 0) {
      pushIssue(
        report,
        makeIssue(
          'donation_project_objectives',
          rowNumber,
          'DB_ERROR',
          'order must be a positive integer',
          'order',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.donationProjectObjective.findUnique({
        where: {
          projectId_order: {
            projectId,
            order,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.donationProjectObjective.create({
          data: {
            projectId,
            objective: row.objective,
            order,
          },
        });
        stage.imported += 1;
      } else {
        await prisma.donationProjectObjective.update({
          where: { id: existing.id },
          data: {
            objective: row.objective,
            order,
          },
        });
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'donation_project_objectives',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importDonationTransactions = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'donation_transactions');
  const filePath = path.join(dir, 'donation_transactions.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'donor_user_external_id',
    'project_external_id',
    'recurring_external_id',
    'type',
    'country_of_residence',
    'payment_mode',
    'date',
    'amount',
    'receipt',
    'is_thank_you_sent',
    'is_admin_notified',
    'submission_status',
    'receipt_status',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'donation_transactions',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const donorExternalId = row.donor_user_external_id;
    const projectExternalId = row.project_external_id;

    if (
      isEmpty(externalId) ||
      isEmpty(donorExternalId) ||
      isEmpty(projectExternalId)
    ) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, donor_user_external_id, project_external_id are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'donation_transactions',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const donorId = context.userIdByExternalId.get(donorExternalId);
    if (!donorId) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Donor with external id ${donorExternalId} not found`,
          'donor_user_external_id',
          externalId,
        ),
      );
      continue;
    }

    const projectId =
      context.donationProjectIdByExternalId.get(projectExternalId);
    if (!projectId) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Donation project with external id ${projectExternalId} not found`,
          'project_external_id',
          externalId,
        ),
      );
      continue;
    }

    const requiredFields = [
      'type',
      'country_of_residence',
      'payment_mode',
      'amount',
      'submission_status',
      'receipt_status',
    ] as const;

    const missingField = requiredFields.find((field) => isEmpty(row[field]));
    if (missingField) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'MISSING_REQUIRED',
          `${missingField} is required`,
          missingField,
          externalId,
        ),
      );
      continue;
    }

    const donationType = resolveEnumValue(row.type, DONATION_TYPES);
    if (!donationType) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'INVALID_ENUM',
          `Invalid type: ${row.type}`,
          'type',
          externalId,
        ),
      );
      continue;
    }

    const submissionStatus = resolveEnumValue(
      row.submission_status,
      SUBMISSION_STATUSES,
    );
    if (!submissionStatus) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'INVALID_ENUM',
          `Invalid submission_status: ${row.submission_status}`,
          'submission_status',
          externalId,
        ),
      );
      continue;
    }

    const receiptStatus = resolveEnumValue(
      row.receipt_status,
      DONATION_RECEIPT_STATUSES,
    );
    if (!receiptStatus) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'INVALID_ENUM',
          `Invalid receipt_status: ${row.receipt_status}`,
          'receipt_status',
          externalId,
        ),
      );
      continue;
    }

    const amount = toDecimalString(row.amount);
    if (!amount || Number(amount) <= 0) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'DB_ERROR',
          'amount must be a positive number',
          'amount',
          externalId,
        ),
      );
      continue;
    }

    const transactionDate = toDate(row.date) ?? new Date();
    if (!isEmpty(row.date) && Number.isNaN(transactionDate.getTime())) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'INVALID_DATE',
          `Invalid date: ${row.date}`,
          'date',
          externalId,
        ),
      );
      continue;
    }

    const isThankYouSent = toBoolean(row.is_thank_you_sent);
    if (!isEmpty(row.is_thank_you_sent) && isThankYouSent === undefined) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'INVALID_BOOLEAN',
          'is_thank_you_sent must be true/false',
          'is_thank_you_sent',
          externalId,
        ),
      );
      continue;
    }

    const isAdminNotified = toBoolean(row.is_admin_notified);
    if (!isEmpty(row.is_admin_notified) && isAdminNotified === undefined) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'INVALID_BOOLEAN',
          'is_admin_notified must be true/false',
          'is_admin_notified',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.donationTransaction.findFirst({
        where: {
          donorId,
          projectId,
          type: donationType,
          amount,
          date: transactionDate,
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.donationTransaction.create({
          data: {
            donorId,
            projectId,
            type: donationType,
            countryOfResidence: row.country_of_residence,
            paymentMode: row.payment_mode,
            date: transactionDate,
            amount,
            receipt: toNullable(row.receipt),
            isThankYouSent: isThankYouSent ?? false,
            isAdminNotified: isAdminNotified ?? false,
            submissionStatus,
            receiptStatus,
          },
        });
        stage.imported += 1;
      } else {
        await prisma.donationTransaction.update({
          where: { id: existing.id },
          data: {
            type: donationType,
            countryOfResidence: row.country_of_residence,
            paymentMode: row.payment_mode,
            date: transactionDate,
            amount,
            receipt: toNullable(row.receipt),
            isThankYouSent: isThankYouSent ?? false,
            isAdminNotified: isAdminNotified ?? false,
            submissionStatus,
            receiptStatus,
          },
        });
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'donation_transactions',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importVolunteerProjects = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'volunteer_projects');
  const filePath = path.join(dir, 'volunteer_projects.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'managed_by_user_external_id',
    'approved_by_user_external_id',
    'title',
    'location',
    'about_desc',
    'objectives',
    'beneficiaries',
    'initiator_name',
    'organising_team',
    'proposed_plan',
    'start_time',
    'end_time',
    'start_date',
    'end_date',
    'frequency',
    'interval',
    'day_of_week',
    'approval_status',
    'operation_status',
    'approval_notes',
    'approval_message',
    'image',
    'attachments',
    'submission_status',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'volunteer_projects',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const managerExternalId = row.managed_by_user_external_id;
    const approverExternalId = toOptional(row.approved_by_user_external_id);

    if (isEmpty(externalId) || isEmpty(managerExternalId)) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id and managed_by_user_external_id are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'volunteer_projects',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const managerId = context.userIdByExternalId.get(managerExternalId);
    if (!managerId) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Manager with external id ${managerExternalId} not found`,
          'managed_by_user_external_id',
          externalId,
        ),
      );
      continue;
    }

    let approvedById: string | null = null;
    if (approverExternalId) {
      approvedById = context.userIdByExternalId.get(approverExternalId) ?? null;
      if (!approvedById) {
        pushIssue(
          report,
          makeIssue(
            'volunteer_projects',
            rowNumber,
            'REFERENCE_NOT_FOUND',
            `Approver with external id ${approverExternalId} not found`,
            'approved_by_user_external_id',
            externalId,
          ),
        );
        continue;
      }
    }

    const requiredFields = [
      'title',
      'location',
      'about_desc',
      'objectives',
      'beneficiaries',
      'start_time',
      'end_time',
      'start_date',
      'end_date',
      'frequency',
    ] as const;

    const missingField = requiredFields.find((field) => isEmpty(row[field]));
    if (missingField) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'MISSING_REQUIRED',
          `${missingField} is required`,
          missingField,
          externalId,
        ),
      );
      continue;
    }

    const frequency = resolveEnumValue(row.frequency, PROJECT_FREQUENCIES);
    if (!frequency) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid frequency: ${row.frequency}`,
          'frequency',
          externalId,
        ),
      );
      continue;
    }

    const startTime = toDate(row.start_time);
    const endTime = toDate(row.end_time);
    const startDate = toDate(row.start_date);
    const endDate = toDate(row.end_date);

    if (!startTime) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid start_time: ${row.start_time}`,
          'start_time',
          externalId,
        ),
      );
      continue;
    }
    if (!endTime) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid end_time: ${row.end_time}`,
          'end_time',
          externalId,
        ),
      );
      continue;
    }
    if (!startDate) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid start_date: ${row.start_date}`,
          'start_date',
          externalId,
        ),
      );
      continue;
    }
    if (!endDate) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_DATE',
          `Invalid end_date: ${row.end_date}`,
          'end_date',
          externalId,
        ),
      );
      continue;
    }

    const intervalRaw = toOptional(row.interval);
    let interval: number | null = null;
    if (intervalRaw) {
      const parsedInterval = Number(intervalRaw);
      if (!Number.isInteger(parsedInterval) || parsedInterval <= 0) {
        pushIssue(
          report,
          makeIssue(
            'volunteer_projects',
            rowNumber,
            'DB_ERROR',
            'interval must be a positive integer',
            'interval',
            externalId,
          ),
        );
        continue;
      }
      interval = parsedInterval;
    }

    const submissionStatusRaw = toOptional(row.submission_status);
    const approvalStatusRaw = toOptional(row.approval_status);
    const operationStatusRaw = toOptional(row.operation_status);

    if (
      submissionStatusRaw &&
      !resolveEnumValue(submissionStatusRaw, SUBMISSION_STATUSES)
    ) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid submission_status: ${submissionStatusRaw}`,
          'submission_status',
          externalId,
        ),
      );
      continue;
    }
    if (
      approvalStatusRaw &&
      !resolveEnumValue(approvalStatusRaw, PROJECT_APPROVAL_STATUSES)
    ) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid approval_status: ${approvalStatusRaw}`,
          'approval_status',
          externalId,
        ),
      );
      continue;
    }
    if (
      operationStatusRaw &&
      !resolveEnumValue(operationStatusRaw, PROJECT_OPERATION_STATUSES)
    ) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'INVALID_ENUM',
          `Invalid operation_status: ${operationStatusRaw}`,
          'operation_status',
          externalId,
        ),
      );
      continue;
    }

    let submissionStatus =
      resolveEnumValue(submissionStatusRaw, SUBMISSION_STATUSES) ?? 'draft';
    let approvalStatus =
      resolveEnumValue(approvalStatusRaw, PROJECT_APPROVAL_STATUSES) ??
      'pending';
    let operationStatus =
      resolveEnumValue(operationStatusRaw, PROJECT_OPERATION_STATUSES) ??
      'notStarted';

    if (submissionStatus === 'submitted') {
      approvalStatus = 'pending';
      operationStatus = 'notStarted';
    }

    if (context.dryRun) {
      context.volunteerProjectIdByExternalId.set(
        externalId,
        `dry-vol-project-${externalId}`,
      );
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.volunteerProject.findFirst({
        where: {
          managedById: managerId,
          title: row.title,
          startDate,
          endDate,
        },
        select: { id: true },
      });

      if (!existing) {
        const created = await prisma.volunteerProject.create({
          data: {
            managedById: managerId,
            approvedById,
            title: row.title,
            location: row.location,
            aboutDesc: row.about_desc,
            objectives: row.objectives,
            beneficiaries: row.beneficiaries,
            initiatorName: toNullable(row.initiator_name),
            organisingTeam: toNullable(row.organising_team),
            proposedPlan: toNullable(row.proposed_plan),
            startTime,
            endTime,
            startDate,
            endDate,
            frequency,
            interval,
            dayOfWeek: toNullable(row.day_of_week),
            approvalStatus,
            operationStatus,
            approvalNotes: toNullable(row.approval_notes),
            approvalMessage: toNullable(row.approval_message),
            image: toNullable(row.image),
            attachments: toNullable(row.attachments),
            submissionStatus,
          },
          select: { id: true },
        });
        context.volunteerProjectIdByExternalId.set(externalId, created.id);
        stage.imported += 1;
      } else {
        await prisma.volunteerProject.update({
          where: { id: existing.id },
          data: {
            managedById: managerId,
            approvedById,
            title: row.title,
            location: row.location,
            aboutDesc: row.about_desc,
            objectives: row.objectives,
            beneficiaries: row.beneficiaries,
            initiatorName: toNullable(row.initiator_name),
            organisingTeam: toNullable(row.organising_team),
            proposedPlan: toNullable(row.proposed_plan),
            startTime,
            endTime,
            startDate,
            endDate,
            frequency,
            interval,
            dayOfWeek: toNullable(row.day_of_week),
            approvalStatus,
            operationStatus,
            approvalNotes: toNullable(row.approval_notes),
            approvalMessage: toNullable(row.approval_message),
            image: toNullable(row.image),
            attachments: toNullable(row.attachments),
            submissionStatus,
          },
        });
        context.volunteerProjectIdByExternalId.set(externalId, existing.id);
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_projects',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importProjectPositions = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'project_positions');
  const filePath = path.join(dir, 'project_positions.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'volunteer_project_external_id',
    'role',
    'description',
    'total_slots',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'project_positions',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const projectExternalId = row.volunteer_project_external_id;

    if (
      isEmpty(externalId) ||
      isEmpty(projectExternalId) ||
      isEmpty(row.role) ||
      isEmpty(row.description) ||
      isEmpty(row.total_slots)
    ) {
      pushIssue(
        report,
        makeIssue(
          'project_positions',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, volunteer_project_external_id, role, description, total_slots are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'project_positions',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const projectId =
      context.volunteerProjectIdByExternalId.get(projectExternalId);
    if (!projectId) {
      pushIssue(
        report,
        makeIssue(
          'project_positions',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Volunteer project with external id ${projectExternalId} not found`,
          'volunteer_project_external_id',
          externalId,
        ),
      );
      continue;
    }

    const totalSlots = Number(row.total_slots);
    if (!Number.isInteger(totalSlots) || totalSlots <= 0) {
      pushIssue(
        report,
        makeIssue(
          'project_positions',
          rowNumber,
          'DB_ERROR',
          'total_slots must be a positive integer',
          'total_slots',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      context.projectPositionIdByExternalId.set(
        externalId,
        `dry-position-${externalId}`,
      );
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.projectPosition.findFirst({
        where: {
          projectId,
          role: row.role,
        },
        select: { id: true },
      });

      if (!existing) {
        const created = await prisma.projectPosition.create({
          data: {
            projectId,
            role: row.role,
            description: row.description,
            totalSlots,
          },
          select: { id: true },
        });
        context.projectPositionIdByExternalId.set(externalId, created.id);
        stage.imported += 1;
      } else {
        await prisma.projectPosition.update({
          where: { id: existing.id },
          data: {
            description: row.description,
            totalSlots,
          },
        });
        context.projectPositionIdByExternalId.set(externalId, existing.id);
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'project_positions',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importProjectSkills = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'project_skills');
  const filePath = path.join(dir, 'project_skills.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'project_position_external_id',
    'skill',
    'order',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'project_skills',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const positionExternalId = row.project_position_external_id;

    if (
      isEmpty(externalId) ||
      isEmpty(positionExternalId) ||
      isEmpty(row.skill) ||
      isEmpty(row.order)
    ) {
      pushIssue(
        report,
        makeIssue(
          'project_skills',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, project_position_external_id, skill, order are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'project_skills',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const projectPositionId =
      context.projectPositionIdByExternalId.get(positionExternalId);
    if (!projectPositionId) {
      pushIssue(
        report,
        makeIssue(
          'project_skills',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Project position with external id ${positionExternalId} not found`,
          'project_position_external_id',
          externalId,
        ),
      );
      continue;
    }

    const order = Number(row.order);
    if (!Number.isInteger(order) || order <= 0) {
      pushIssue(
        report,
        makeIssue(
          'project_skills',
          rowNumber,
          'DB_ERROR',
          'order must be a positive integer',
          'order',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.projectSkill.findUnique({
        where: {
          projectPositionId_order: {
            projectPositionId,
            order,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.projectSkill.create({
          data: {
            projectPositionId,
            skill: row.skill,
            order,
          },
        });
        stage.imported += 1;
      } else {
        await prisma.projectSkill.update({
          where: { id: existing.id },
          data: {
            skill: row.skill,
            order,
          },
        });
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'project_skills',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importSessions = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'sessions');
  const filePath = path.join(dir, 'sessions.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'volunteer_project_external_id',
    'session_date',
    'name',
    'start_time',
    'end_time',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'sessions',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const projectExternalId = row.volunteer_project_external_id;

    if (
      isEmpty(externalId) ||
      isEmpty(projectExternalId) ||
      isEmpty(row.session_date) ||
      isEmpty(row.name) ||
      isEmpty(row.start_time) ||
      isEmpty(row.end_time)
    ) {
      pushIssue(
        report,
        makeIssue(
          'sessions',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, volunteer_project_external_id, session_date, name, start_time, end_time are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'sessions',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const projectId =
      context.volunteerProjectIdByExternalId.get(projectExternalId);
    if (!projectId) {
      pushIssue(
        report,
        makeIssue(
          'sessions',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Volunteer project with external id ${projectExternalId} not found`,
          'volunteer_project_external_id',
          externalId,
        ),
      );
      continue;
    }

    const sessionDate = toDate(row.session_date);
    const startTime = toDate(row.start_time);
    const endTime = toDate(row.end_time);

    if (!sessionDate) {
      pushIssue(
        report,
        makeIssue(
          'sessions',
          rowNumber,
          'INVALID_DATE',
          `Invalid session_date: ${row.session_date}`,
          'session_date',
          externalId,
        ),
      );
      continue;
    }
    if (!startTime) {
      pushIssue(
        report,
        makeIssue(
          'sessions',
          rowNumber,
          'INVALID_DATE',
          `Invalid start_time: ${row.start_time}`,
          'start_time',
          externalId,
        ),
      );
      continue;
    }
    if (!endTime) {
      pushIssue(
        report,
        makeIssue(
          'sessions',
          rowNumber,
          'INVALID_DATE',
          `Invalid end_time: ${row.end_time}`,
          'end_time',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      context.sessionIdByExternalId.set(
        externalId,
        `dry-session-${externalId}`,
      );
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.session.findFirst({
        where: {
          projectId,
          name: row.name,
          sessionDate,
        },
        select: { id: true },
      });

      if (!existing) {
        const created = await prisma.session.create({
          data: {
            projectId,
            sessionDate,
            name: row.name,
            startTime,
            endTime,
          },
          select: { id: true },
        });
        context.sessionIdByExternalId.set(externalId, created.id);
        stage.imported += 1;
      } else {
        await prisma.session.update({
          where: { id: existing.id },
          data: {
            sessionDate,
            name: row.name,
            startTime,
            endTime,
          },
        });
        context.sessionIdByExternalId.set(externalId, existing.id);
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'sessions',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importVolunteerProjectObjectives = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(
    report.summaries,
    'volunteer_project_objectives',
  );
  const filePath = path.join(dir, 'volunteer_project_objectives.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'volunteer_project_external_id',
    'objective',
    'order',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'volunteer_project_objectives',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const projectExternalId = row.volunteer_project_external_id;

    if (
      isEmpty(externalId) ||
      isEmpty(projectExternalId) ||
      isEmpty(row.objective) ||
      isEmpty(row.order)
    ) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_project_objectives',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, volunteer_project_external_id, objective, order are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'volunteer_project_objectives',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const volunteerProjectId =
      context.volunteerProjectIdByExternalId.get(projectExternalId);
    if (!volunteerProjectId) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_project_objectives',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Volunteer project with external id ${projectExternalId} not found`,
          'volunteer_project_external_id',
          externalId,
        ),
      );
      continue;
    }

    const order = Number(row.order);
    if (!Number.isInteger(order) || order <= 0) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_project_objectives',
          rowNumber,
          'DB_ERROR',
          'order must be a positive integer',
          'order',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.volunteerProjectObjective.findUnique({
        where: {
          volunteerProjectId_order: {
            volunteerProjectId,
            order,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.volunteerProjectObjective.create({
          data: {
            volunteerProjectId,
            objective: row.objective,
            order,
          },
        });
        stage.imported += 1;
      } else {
        await prisma.volunteerProjectObjective.update({
          where: { id: existing.id },
          data: {
            objective: row.objective,
            order,
          },
        });
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_project_objectives',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importVolunteerApplications = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'volunteer_applications');
  const filePath = path.join(dir, 'volunteer_applications.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'volunteer_user_external_id',
    'project_position_external_id',
    'availability',
    'status',
    'approved_at',
    'approved_by_user_external_id',
    'approval_notes',
    'approval_message',
    'has_consented',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'volunteer_applications',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const volunteerExternalId = row.volunteer_user_external_id;
    const positionExternalId = row.project_position_external_id;
    const approverExternalId = toOptional(row.approved_by_user_external_id);

    if (
      isEmpty(externalId) ||
      isEmpty(volunteerExternalId) ||
      isEmpty(positionExternalId) ||
      isEmpty(row.status) ||
      isEmpty(row.has_consented)
    ) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, volunteer_user_external_id, project_position_external_id, status, has_consented are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'volunteer_applications',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const volunteerId = context.userIdByExternalId.get(volunteerExternalId);
    if (!volunteerId) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Volunteer user with external id ${volunteerExternalId} not found`,
          'volunteer_user_external_id',
          externalId,
        ),
      );
      continue;
    }

    const positionId =
      context.projectPositionIdByExternalId.get(positionExternalId);
    if (!positionId) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Project position with external id ${positionExternalId} not found`,
          'project_position_external_id',
          externalId,
        ),
      );
      continue;
    }

    const status = resolveEnumValue(row.status, VOLUNTEER_POSITION_STATUSES);
    if (!status) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'INVALID_ENUM',
          `Invalid status: ${row.status}`,
          'status',
          externalId,
        ),
      );
      continue;
    }

    const hasConsented = toBoolean(row.has_consented);
    if (hasConsented === undefined) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'INVALID_BOOLEAN',
          'has_consented must be true/false',
          'has_consented',
          externalId,
        ),
      );
      continue;
    }

    const approvedAt = toDate(row.approved_at);
    if (!isEmpty(row.approved_at) && !approvedAt) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'INVALID_DATE',
          `Invalid approved_at: ${row.approved_at}`,
          'approved_at',
          externalId,
        ),
      );
      continue;
    }

    let approvedBy: string | null = null;
    if (approverExternalId) {
      approvedBy = context.userIdByExternalId.get(approverExternalId) ?? null;
      if (!approvedBy) {
        pushIssue(
          report,
          makeIssue(
            'volunteer_applications',
            rowNumber,
            'REFERENCE_NOT_FOUND',
            `Approver with external id ${approverExternalId} not found`,
            'approved_by_user_external_id',
            externalId,
          ),
        );
        continue;
      }
    }

    if (context.dryRun) {
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.volunteerProjectPosition.findUnique({
        where: {
          volunteerId_positionId: {
            volunteerId,
            positionId,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.volunteerProjectPosition.create({
          data: {
            volunteerId,
            positionId,
            availability: toNullable(row.availability),
            status,
            approvedAt: approvedAt ?? null,
            approvedBy,
            approvalNotes: toNullable(row.approval_notes),
            approvalMessage: toNullable(row.approval_message),
            hasConsented,
          },
        });
        stage.imported += 1;
      } else {
        await prisma.volunteerProjectPosition.update({
          where: { id: existing.id },
          data: {
            availability: toNullable(row.availability),
            status,
            approvedAt: approvedAt ?? null,
            approvedBy,
            approvalNotes: toNullable(row.approval_notes),
            approvalMessage: toNullable(row.approval_message),
            hasConsented,
          },
        });
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_applications',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const importVolunteerSessions = async (
  dir: string,
  report: ImportReport,
  context: ImportContext,
) => {
  const stage = getOrCreateStage(report.summaries, 'volunteer_sessions');
  const filePath = path.join(dir, 'volunteer_sessions.csv');
  const { headers, rows } = await readCsv(filePath);

  const missingHeaders = hasColumns(headers, [
    'external_id',
    'volunteer_user_external_id',
    'session_external_id',
    'approved_at',
    'approved_by_user_external_id',
    'has_rsvp',
    'has_attended',
  ]);

  if (missingHeaders.length > 0) {
    pushIssue(
      report,
      makeIssue(
        'volunteer_sessions',
        1,
        'MISSING_REQUIRED',
        `Missing headers: ${missingHeaders.join(', ')}`,
      ),
    );
    return;
  }

  const seenExternalIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stage.processed += 1;

    const externalId = row.external_id;
    const volunteerExternalId = row.volunteer_user_external_id;
    const sessionExternalId = row.session_external_id;
    const approverExternalId = toOptional(row.approved_by_user_external_id);

    if (
      isEmpty(externalId) ||
      isEmpty(volunteerExternalId) ||
      isEmpty(sessionExternalId)
    ) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'MISSING_REQUIRED',
          'external_id, volunteer_user_external_id, session_external_id are required',
          undefined,
          externalId,
        ),
      );
      continue;
    }

    if (
      isDuplicateExternalId(
        seenExternalIds,
        'volunteer_sessions',
        rowNumber,
        externalId,
        report,
      )
    ) {
      continue;
    }

    const volunteerId = context.userIdByExternalId.get(volunteerExternalId);
    if (!volunteerId) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Volunteer with external id ${volunteerExternalId} not found`,
          'volunteer_user_external_id',
          externalId,
        ),
      );
      continue;
    }

    const sessionId = context.sessionIdByExternalId.get(sessionExternalId);
    if (!sessionId) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'REFERENCE_NOT_FOUND',
          `Session with external id ${sessionExternalId} not found`,
          'session_external_id',
          externalId,
        ),
      );
      continue;
    }

    const approvedAt = toDate(row.approved_at);
    if (!isEmpty(row.approved_at) && !approvedAt) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'INVALID_DATE',
          `Invalid approved_at: ${row.approved_at}`,
          'approved_at',
          externalId,
        ),
      );
      continue;
    }

    let approvedBy: string | null = null;
    if (approverExternalId) {
      approvedBy = context.userIdByExternalId.get(approverExternalId) ?? null;
      if (!approvedBy) {
        pushIssue(
          report,
          makeIssue(
            'volunteer_sessions',
            rowNumber,
            'REFERENCE_NOT_FOUND',
            `Approver with external id ${approverExternalId} not found`,
            'approved_by_user_external_id',
            externalId,
          ),
        );
        continue;
      }
    }

    const hasRsvp = toBoolean(row.has_rsvp);
    if (!isEmpty(row.has_rsvp) && hasRsvp === undefined) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'INVALID_BOOLEAN',
          'has_rsvp must be true/false',
          'has_rsvp',
          externalId,
        ),
      );
      continue;
    }

    const hasAttended = toBoolean(row.has_attended);
    if (!isEmpty(row.has_attended) && hasAttended === undefined) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'INVALID_BOOLEAN',
          'has_attended must be true/false',
          'has_attended',
          externalId,
        ),
      );
      continue;
    }

    if (context.dryRun) {
      stage.imported += 1;
      continue;
    }

    try {
      const existing = await prisma.volunteerSession.findUnique({
        where: {
          volunteerId_sessionId: {
            volunteerId,
            sessionId,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.volunteerSession.create({
          data: {
            volunteerId,
            sessionId,
            approvedAt: approvedAt ?? null,
            approvedBy,
            has_rsvp: hasRsvp ?? null,
            has_attended: hasAttended ?? null,
          },
        });
        stage.imported += 1;
      } else {
        await prisma.volunteerSession.update({
          where: { id: existing.id },
          data: {
            approvedAt: approvedAt ?? null,
            approvedBy,
            has_rsvp: hasRsvp ?? null,
            has_attended: hasAttended ?? null,
          },
        });
        stage.updated += 1;
      }
    } catch (error) {
      pushIssue(
        report,
        makeIssue(
          'volunteer_sessions',
          rowNumber,
          'DB_ERROR',
          (error as Error).message,
          undefined,
          externalId,
        ),
      );
    }
  }
};

const run = async () => {
  const args = parseArgs();

  const report: ImportReport = {
    startedAt: new Date().toISOString(),
    dryRun: args.dryRun,
    sourceDir: path.relative(process.cwd(), args.dir) || '.',
    summaries: [],
    issues: [],
  };

  const context: ImportContext = {
    dryRun: args.dryRun,
    userIdByExternalId: new Map<string, string>(),
    userIdByEmail: new Map<string, string>(),
    partnerIdByExternalId: new Map<string, string>(),
    donationProjectIdByExternalId: new Map<string, string>(),
    volunteerProjectIdByExternalId: new Map<string, string>(),
    projectPositionIdByExternalId: new Map<string, string>(),
    sessionIdByExternalId: new Map<string, string>(),
  };

  try {
    await importUsers(args.dir, report, context);
    await importPartners(args.dir, report, context);

    await importDonationProjects(args.dir, report, context);
    await importDonationProjectObjectives(args.dir, report, context);
    await importDonationTransactions(args.dir, report, context);
    await importVolunteerProjects(args.dir, report, context);
    await importProjectPositions(args.dir, report, context);
    await importProjectSkills(args.dir, report, context);
    await importSessions(args.dir, report, context);
    await importVolunteerProjectObjectives(args.dir, report, context);
    await importVolunteerApplications(args.dir, report, context);
    await importVolunteerSessions(args.dir, report, context);
  } finally {
    report.finishedAt = new Date().toISOString();
    const reportPath = await writeReport(
      path.resolve(process.cwd(), 'docs/data-import/reports'),
      report,
    );

    const imported = report.summaries.reduce(
      (acc, item) => acc + item.imported,
      0,
    );
    const updated = report.summaries.reduce(
      (acc, item) => acc + item.updated,
      0,
    );
    const rejected = report.summaries.reduce(
      (acc, item) => acc + item.rejected,
      0,
    );
    const skipped = report.summaries.reduce(
      (acc, item) => acc + item.skipped,
      0,
    );

    console.log(`Import complete. dryRun=${args.dryRun}`);
    console.log(
      `Imported: ${imported} | Updated: ${updated} | Rejected: ${rejected} | Skipped: ${skipped}`,
    );
    console.log(`Report: ${reportPath}`);

    await prisma.$disconnect();
  }
};

run().catch(async (error) => {
  console.error('Import failed:', error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
