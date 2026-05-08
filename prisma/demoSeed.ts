import {
  ContactModeType,
  DonationFrequency,
  DonationReceiptStatus,
  DonationType,
  EmailCampaignStatus,
  EmailRecipientStatus,
  EmailRecipientType,
  EmailStatus,
  Gender,
  InterestSlug,
  PartnerFeedbackType,
  Prisma,
  PrismaClient,
  ProjectApprovalStatus,
  ProjectFrequency,
  ProjectOperationStatus,
  ProjectType,
  RecurringDonationStatus,
  ReferrerType,
  SubmissionStatus,
  UserRole,
  VolunteerProjectPositionStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'password';

type SeedUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title: string;
  role: UserRole;
  isActive?: boolean;
  mustChangePassword?: boolean;
};

type PartnerProfileSeed = {
  email: string;
  dob: string;
  countryCode: string;
  contactNumber: string;
  emergencyCountryCode: string;
  emergencyContactNumber: string;
  identificationNumber: string;
  nationality: string;
  occupation: string;
  gender: Gender;
  residentialAddress: string;
  volunteerAvailability: string;
  hasVolunteerExperience: boolean;
  consentUpdatesCommunications: boolean;
  subscribeNewsletterEvents: boolean;
  skills: string[];
  languages: string[];
  contactModes: ContactModeType[];
  interests: InterestSlug[];
  referrers: ReferrerType[];
  otherInterests?: string;
  otherReferrers?: string;
  otherContactModes?: string;
  tripForm?: {
    fullName: string;
    passportNumber: string;
    passportExpiry: string;
    healthDeclaration?: string;
  };
};

type VolunteerProjectSeed = {
  title: string;
  managerEmail: string;
  approverEmail?: string;
  location: string;
  aboutDesc: string;
  objectives: string;
  beneficiaries: string;
  initiatorName: string;
  organisingTeam: string;
  proposedPlan: string;
  startOffsetDays: number;
  endOffsetDays: number;
  startTime: string;
  endTime: string;
  frequency: ProjectFrequency;
  interval?: number | null;
  dayOfWeek?: string | null;
  submissionStatus: SubmissionStatus;
  approvalStatus: ProjectApprovalStatus;
  operationStatus: ProjectOperationStatus;
  approvalNotes?: string | null;
  approvalMessage?: string | null;
  image: string;
  objectivesList: string[];
  sessions: {
    name: string;
    offsetDays: number;
    startTime: string;
    endTime: string;
  }[];
  positions: {
    role: string;
    description: string;
    totalSlots: number;
    skills: string[];
  }[];
};

type DonationProjectSeed = {
  title: string;
  managerEmail: string;
  location: string;
  about: string;
  objectives: string;
  beneficiaries: string;
  initiatorName: string;
  organisingTeam: string;
  targetFund?: string | null;
  brickSize?: string | null;
  deadlineOffsetDays?: number | null;
  type: ProjectType;
  startOffsetDays: number;
  endOffsetDays: number;
  submissionStatus: SubmissionStatus;
  approvalStatus: ProjectApprovalStatus;
  operationStatus: ProjectOperationStatus;
  approvalNotes?: string | null;
  image: string;
  objectivesList: string[];
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function withTime(base: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(base);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function money(amount: string) {
  return new Prisma.Decimal(amount);
}

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  console.log('Seeding realistic demo data...');

  const today = new Date();
  const anchorDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const usersData: SeedUser[] = [
    {
      email: 'superadmin@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Clara',
      lastName: 'Ong',
      title: 'Executive Director',
      role: UserRole.superAdmin,
    },
    {
      email: 'subadmin@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Samuel',
      lastName: 'Low',
      title: 'Operations Administrator',
      role: UserRole.subAdmin,
    },
    {
      email: 'gm@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Grace',
      lastName: 'Tan',
      title: 'General Manager, Programmes',
      role: UserRole.generalManager,
    },
    {
      email: 'finance@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Felix',
      lastName: 'Ng',
      title: 'Finance Manager',
      role: UserRole.financeManager,
    },
    {
      email: 'alicia.partner@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Alicia',
      lastName: 'Lim',
      title: 'Primary School Teacher',
      role: UserRole.partner,
    },
    {
      email: 'rahul.partner@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Rahul',
      lastName: 'Singh',
      title: 'Civil Engineer',
      role: UserRole.partner,
    },
    {
      email: 'aisha.partner@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Nur Aisha',
      lastName: 'Rahman',
      title: 'Programme Executive',
      role: UserRole.partner,
    },
    {
      email: 'joshua.partner@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Joshua',
      lastName: 'Koh',
      title: 'Logistics Coordinator',
      role: UserRole.partner,
    },
    {
      email: 'farah.partner@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Farah',
      lastName: 'Ismail',
      title: 'Staff Nurse',
      role: UserRole.partner,
    },
    {
      email: 'priya.partner@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Priya',
      lastName: 'Nair',
      title: 'Corporate Communications Lead',
      role: UserRole.partner,
    },
    {
      email: 'daniel.donor@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Daniel',
      lastName: 'Tan',
      title: 'Product Manager',
      role: UserRole.partner,
    },
    {
      email: 'mei.donor@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Mei',
      lastName: 'Chen',
      title: 'Finance Director',
      role: UserRole.partner,
    },
    {
      email: 'hanwei.donor@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Han Wei',
      lastName: 'Lee',
      title: 'SME Owner',
      role: UserRole.partner,
    },
    {
      email: 'serene.donor@siloam.org',
      password: DEFAULT_PASSWORD,
      firstName: 'Serene',
      lastName: 'Wong',
      title: 'Retired Counsellor',
      role: UserRole.partner,
    },
  ];

  const usersByEmail: Record<string, { id: string; email: string }> = {};
  for (const userData of usersData) {
    const passwordHash = await hashPassword(userData.password);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        title: userData.title,
        role: userData.role,
        passwordHash,
        isActive: userData.isActive ?? true,
        mustChangePassword: userData.mustChangePassword ?? false,
      },
      create: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
        role: userData.role,
        title: userData.title,
        isActive: userData.isActive ?? true,
        mustChangePassword: userData.mustChangePassword ?? false,
      },
    });
    usersByEmail[userData.email] = user;
  }

  const requireUser = (email: string) => {
    const user = usersByEmail[email];
    if (!user) {
      throw new Error(`Missing seeded user for ${email}`);
    }
    return user;
  };

  const partnerProfiles: PartnerProfileSeed[] = [
    {
      email: 'alicia.partner@siloam.org',
      dob: '1991-04-12',
      countryCode: '+65',
      contactNumber: '81234567',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '91234567',
      identificationNumber: 'S9123456A',
      nationality: 'Singaporean',
      occupation: 'Primary school teacher',
      gender: Gender.female,
      residentialAddress: '123 Tampines Avenue 1, #08-12, Singapore 529123',
      volunteerAvailability: 'Saturday mornings and school holiday weekdays',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Teaching', 'Facilitation', 'Lesson Planning', 'Child Safety'],
      languages: ['English', 'Mandarin', 'Hokkien'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [
        InterestSlug.teaching,
        InterestSlug.training,
        InterestSlug.publicity,
      ],
      referrers: [ReferrerType.friend, ReferrerType.church],
      tripForm: {
        fullName: 'Alicia Lim',
        passportNumber: 'E12345678',
        passportExpiry: '2030-01-01',
        healthDeclaration: 'Mild dust allergy. No mobility restrictions.',
      },
    },
    {
      email: 'rahul.partner@siloam.org',
      dob: '1988-11-02',
      countryCode: '+65',
      contactNumber: '82345678',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '92345678',
      identificationNumber: 'S8812345B',
      nationality: 'Singapore Permanent Resident',
      occupation: 'Civil engineer',
      gender: Gender.male,
      residentialAddress: '8 Jurong East Street 21, #11-06, Singapore 609602',
      volunteerAvailability: 'Weekday evenings and alternate Sundays',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: false,
      skills: ['Mentoring', 'Site Safety', 'Logistics', 'Spreadsheet Reporting'],
      languages: ['English', 'Tamil', 'Hindi'],
      contactModes: [ContactModeType.email, ContactModeType.telegram],
      interests: [InterestSlug.planTrips, InterestSlug.building, InterestSlug.admin],
      referrers: [ReferrerType.socialMedia],
      tripForm: {
        fullName: 'Rahul Singh',
        passportNumber: 'K76543210',
        passportExpiry: '2029-07-15',
        healthDeclaration: 'No known chronic conditions.',
      },
    },
    {
      email: 'aisha.partner@siloam.org',
      dob: '1995-07-08',
      countryCode: '+65',
      contactNumber: '83456789',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '93456789',
      identificationNumber: 'S9512345C',
      nationality: 'Malaysian',
      occupation: 'Programme executive',
      gender: Gender.female,
      residentialAddress: '55 Bedok North Street 3, #04-22, Singapore 460055',
      volunteerAvailability: 'Flexible weekday afternoons',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Community Outreach', 'Event Coordination', 'Photography'],
      languages: ['English', 'Malay'],
      contactModes: [ContactModeType.phoneCall, ContactModeType.messenger],
      interests: [
        InterestSlug.fundraise,
        InterestSlug.publicity,
        InterestSlug.others,
      ],
      referrers: [ReferrerType.event, ReferrerType.other],
      otherInterests: 'Documenting beneficiary stories for internal reports',
      otherReferrers: 'Met the Siloam team at a volunteer fair',
      otherContactModes: 'SMS for urgent same-day changes',
    },
    {
      email: 'joshua.partner@siloam.org',
      dob: '1984-02-19',
      countryCode: '+65',
      contactNumber: '84567890',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '94567890',
      identificationNumber: 'S8423456D',
      nationality: 'Singaporean',
      occupation: 'Logistics coordinator',
      gender: Gender.male,
      residentialAddress: '31 Hougang Avenue 7, #09-04, Singapore 538800',
      volunteerAvailability: 'Early mornings before 1pm',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Inventory Control', 'Route Planning', 'Manual Handling'],
      languages: ['English', 'Mandarin'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [InterestSlug.admin, InterestSlug.planTrips, InterestSlug.fundraise],
      referrers: [ReferrerType.website],
    },
    {
      email: 'farah.partner@siloam.org',
      dob: '1990-09-27',
      countryCode: '+65',
      contactNumber: '85678901',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '95678901',
      identificationNumber: 'S9034567E',
      nationality: 'Singaporean',
      occupation: 'Staff nurse',
      gender: Gender.female,
      residentialAddress: '17 Woodlands Drive 72, #12-18, Singapore 738093',
      volunteerAvailability: 'Rotating shifts, best confirmed two weeks ahead',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Basic Health Screening', 'Triage', 'Patient Communication'],
      languages: ['English', 'Malay', 'Mandarin'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [InterestSlug.training, InterestSlug.longTerm, InterestSlug.teaching],
      referrers: [ReferrerType.friend],
    },
    {
      email: 'priya.partner@siloam.org',
      dob: '1986-12-05',
      countryCode: '+65',
      contactNumber: '86789012',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '96789012',
      identificationNumber: 'S8645678F',
      nationality: 'Singaporean',
      occupation: 'Corporate communications lead',
      gender: Gender.female,
      residentialAddress: '2 Tanjong Pagar Plaza, #16-06, Singapore 082002',
      volunteerAvailability: 'Weeknight remote support and monthly Saturdays',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Copywriting', 'Donor Stewardship', 'Campaign Planning'],
      languages: ['English', 'Tamil'],
      contactModes: [ContactModeType.email, ContactModeType.telegram],
      interests: [InterestSlug.publicity, InterestSlug.fundraise, InterestSlug.admin],
      referrers: [ReferrerType.church],
    },
    {
      email: 'daniel.donor@siloam.org',
      dob: '1983-06-16',
      countryCode: '+65',
      contactNumber: '87890123',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '97890123',
      identificationNumber: 'S8356789G',
      nationality: 'Singaporean',
      occupation: 'Product manager',
      gender: Gender.male,
      residentialAddress: '70 Shenton Way, #21-05, Singapore 079118',
      volunteerAvailability: 'Quarterly corporate volunteering days',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Product Strategy', 'User Research', 'Workshop Design'],
      languages: ['English', 'Mandarin'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [InterestSlug.fundraise, InterestSlug.training],
      referrers: [ReferrerType.event],
    },
    {
      email: 'mei.donor@siloam.org',
      dob: '1979-03-22',
      countryCode: '+65',
      contactNumber: '88901234',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '98901234',
      identificationNumber: 'S7967890H',
      nationality: 'Singapore Permanent Resident',
      occupation: 'Finance director',
      gender: Gender.female,
      residentialAddress: '6 Battery Road, #15-01, Singapore 049909',
      volunteerAvailability: 'Finance review support by appointment',
      hasVolunteerExperience: false,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: false,
      skills: ['Budget Review', 'Governance', 'Corporate Giving'],
      languages: ['English', 'Mandarin', 'Cantonese'],
      contactModes: [ContactModeType.email, ContactModeType.phoneCall],
      interests: [InterestSlug.fundraise, InterestSlug.admin],
      referrers: [ReferrerType.friend],
    },
    {
      email: 'hanwei.donor@siloam.org',
      dob: '1975-10-11',
      countryCode: '+65',
      contactNumber: '89012345',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '99012345',
      identificationNumber: 'S7578901I',
      nationality: 'Singaporean',
      occupation: 'SME owner',
      gender: Gender.male,
      residentialAddress: '101 Upper Cross Street, #07-09, Singapore 058357',
      volunteerAvailability: 'One Friday morning each month',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Procurement', 'Supplier Negotiation', 'Delivery Coordination'],
      languages: ['English', 'Mandarin', 'Teochew'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [InterestSlug.fundraise, InterestSlug.planTrips],
      referrers: [ReferrerType.website],
    },
    {
      email: 'serene.donor@siloam.org',
      dob: '1968-01-31',
      countryCode: '+65',
      contactNumber: '80123456',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '90123456',
      identificationNumber: 'S6812345J',
      nationality: 'Singaporean',
      occupation: 'Retired counsellor',
      gender: Gender.female,
      residentialAddress: '40 Holland Drive, #05-13, Singapore 270040',
      volunteerAvailability: 'Tuesday and Thursday afternoons',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Befriending', 'Active Listening', 'Caregiver Support'],
      languages: ['English', 'Mandarin'],
      contactModes: [ContactModeType.email, ContactModeType.phoneCall],
      interests: [InterestSlug.longTerm, InterestSlug.teaching],
      referrers: [ReferrerType.church],
    },
  ];

  const partnersByEmail: Record<string, { id: string }> = {};
  for (const profile of partnerProfiles) {
    const user = requireUser(profile.email);
    const profileData = {
      dob: dateOnly(profile.dob),
      countryCode: profile.countryCode,
      contactNumber: profile.contactNumber,
      emergencyCountryCode: profile.emergencyCountryCode,
      emergencyContactNumber: profile.emergencyContactNumber,
      identificationNumber: profile.identificationNumber,
      nationality: profile.nationality,
      occupation: profile.occupation,
      gender: profile.gender,
      residentialAddress: profile.residentialAddress,
      volunteerAvailability: profile.volunteerAvailability,
      hasVolunteerExperience: profile.hasVolunteerExperience,
      consentUpdatesCommunications: profile.consentUpdatesCommunications,
      subscribeNewsletterEvents: profile.subscribeNewsletterEvents,
      otherInterests: profile.otherInterests ?? null,
      otherReferrers: profile.otherReferrers ?? null,
      otherContactModes: profile.otherContactModes ?? null,
    };

    const partner = await prisma.partner.upsert({
      where: { userId: user.id },
      update: {
        ...profileData,
        skills: {
          deleteMany: {},
          create: profile.skills.map((skill) => ({ skill })),
        },
        languages: {
          deleteMany: {},
          create: profile.languages.map((language) => ({ language })),
        },
        contactModes: {
          deleteMany: {},
          create: profile.contactModes.map((mode) => ({ mode })),
        },
        interests: {
          deleteMany: {},
          create: profile.interests.map((interestSlug) => ({ interestSlug })),
        },
        referrers: {
          deleteMany: {},
          create: profile.referrers.map((referrer) => ({ referrer })),
        },
      },
      create: {
        user: { connect: { id: user.id } },
        ...profileData,
        skills: {
          create: profile.skills.map((skill) => ({ skill })),
        },
        languages: {
          create: profile.languages.map((language) => ({ language })),
        },
        contactModes: {
          create: profile.contactModes.map((mode) => ({ mode })),
        },
        interests: {
          create: profile.interests.map((interestSlug) => ({ interestSlug })),
        },
        referrers: {
          create: profile.referrers.map((referrer) => ({ referrer })),
        },
      },
    });

    partnersByEmail[profile.email] = partner;

    if (profile.tripForm) {
      await prisma.tripForm.upsert({
        where: { partnerId: partner.id },
        update: {
          fullName: profile.tripForm.fullName,
          passportNumber: profile.tripForm.passportNumber,
          passportExpiry: dateOnly(profile.tripForm.passportExpiry),
          healthDeclaration: profile.tripForm.healthDeclaration ?? null,
        },
        create: {
          partner: { connect: { id: partner.id } },
          fullName: profile.tripForm.fullName,
          passportNumber: profile.tripForm.passportNumber,
          passportExpiry: dateOnly(profile.tripForm.passportExpiry),
          healthDeclaration: profile.tripForm.healthDeclaration ?? null,
        },
      });
    }
  }

  const tagsData = [
    { name: 'Reliable', slug: 'reliable', color: '#2E7D32' },
    { name: 'Calm Under Pressure', slug: 'calm-under-pressure', color: '#00695C' },
    { name: 'Team Player', slug: 'team-player', color: '#1565C0' },
    { name: 'Warm Communicator', slug: 'warm-communicator', color: '#AD1457' },
    { name: 'Detail Oriented', slug: 'detail-oriented', color: '#EF6C00' },
  ];

  const tagsBySlug: Record<string, { id: string }> = {};
  for (const tag of tagsData) {
    const createdTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {
        name: tag.name,
        color: tag.color,
        isActive: true,
      },
      create: tag,
    });
    tagsBySlug[tag.slug] = createdTag;
  }

  async function upsertVolunteerProject(seed: VolunteerProjectSeed) {
    const manager = requireUser(seed.managerEmail);
    const approver = seed.approverEmail ? requireUser(seed.approverEmail) : null;
    const startDate = addDays(anchorDate, seed.startOffsetDays);
    const endDate = addDays(anchorDate, seed.endOffsetDays);
    const projectData = {
      title: seed.title,
      location: seed.location,
      aboutDesc: seed.aboutDesc,
      objectives: seed.objectives,
      beneficiaries: seed.beneficiaries,
      initiatorName: seed.initiatorName,
      organisingTeam: seed.organisingTeam,
      proposedPlan: seed.proposedPlan,
      startDate,
      endDate,
      startTime: withTime(startDate, seed.startTime),
      endTime: withTime(endDate, seed.endTime),
      frequency: seed.frequency,
      interval: seed.interval ?? null,
      dayOfWeek: seed.dayOfWeek ?? null,
      submissionStatus: seed.submissionStatus,
      approvalStatus: seed.approvalStatus,
      operationStatus: seed.operationStatus,
      approvalNotes: seed.approvalNotes ?? null,
      approvalMessage: seed.approvalMessage ?? null,
      image: seed.image,
      attachments: null,
    };

    const existing = await prisma.volunteerProject.findFirst({
      where: { title: seed.title },
      select: { id: true },
    });

    const project = existing
      ? await prisma.volunteerProject.update({
        where: { id: existing.id },
        data: {
          ...projectData,
          managedBy: { connect: { id: manager.id } },
          approvedBy: approver
            ? { connect: { id: approver.id } }
            : { disconnect: true },
          objectivesList: {
            deleteMany: {},
            create: seed.objectivesList.map((objective, index) => ({
              objective,
              order: index + 1,
            })),
          },
        },
      })
      : await prisma.volunteerProject.create({
        data: {
          ...projectData,
          managedBy: { connect: { id: manager.id } },
          ...(approver
            ? { approvedBy: { connect: { id: approver.id } } }
            : {}),
          objectivesList: {
            create: seed.objectivesList.map((objective, index) => ({
              objective,
              order: index + 1,
            })),
          },
        },
      });

    for (const session of seed.sessions) {
      const sessionDate = addDays(anchorDate, session.offsetDays);
      const existingSession = await prisma.session.findFirst({
        where: {
          projectId: project.id,
          name: session.name,
        },
      });
      const sessionData = {
        sessionDate,
        startTime: withTime(sessionDate, session.startTime),
        endTime: withTime(sessionDate, session.endTime),
      };
      if (existingSession) {
        await prisma.session.update({
          where: { id: existingSession.id },
          data: sessionData,
        });
      } else {
        await prisma.session.create({
          data: {
            project: { connect: { id: project.id } },
            name: session.name,
            ...sessionData,
          },
        });
      }
    }

    for (const position of seed.positions) {
      const existingPosition = await prisma.projectPosition.findFirst({
        where: {
          projectId: project.id,
          role: position.role,
        },
      });

      if (existingPosition) {
        await prisma.projectPosition.update({
          where: { id: existingPosition.id },
          data: {
            description: position.description,
            totalSlots: position.totalSlots,
            skills: {
              deleteMany: {},
              create: position.skills.map((skill, index) => ({
                skill,
                order: index + 1,
              })),
            },
          },
        });
      } else {
        await prisma.projectPosition.create({
          data: {
            project: { connect: { id: project.id } },
            role: position.role,
            description: position.description,
            totalSlots: position.totalSlots,
            skills: {
              create: position.skills.map((skill, index) => ({
                skill,
                order: index + 1,
              })),
            },
          },
        });
      }
    }

    return prisma.volunteerProject.findUniqueOrThrow({
      where: { id: project.id },
      include: {
        positions: true,
        sessions: true,
      },
    });
  }

  const volunteerProjectSeeds: VolunteerProjectSeed[] = [
    {
      title: 'Community Health Screening and Care Navigation',
      managerEmail: 'gm@siloam.org',
      approverEmail: 'gm@siloam.org',
      location: 'Tampines West Community Club, Singapore',
      aboutDesc:
        'Run a neighbourhood screening day with blood pressure checks, queue support, and care navigation for residents who need follow-up help.',
      objectives:
        'Offer a dignified first point of care, keep waiting times below 20 minutes, and connect residents to appropriate clinic or social support.',
      beneficiaries: 'Seniors, caregivers, and lower-income residents in Tampines',
      initiatorName: 'Siloam Community Clinic',
      organisingTeam: 'Clinic Outreach and Volunteer Operations',
      proposedPlan:
        'Volunteers complete a 30-minute briefing, support two half-day screening shifts, and document residents who request follow-up calls.',
      startOffsetDays: 12,
      endOffsetDays: 12,
      startTime: '08:30',
      endTime: '15:30',
      frequency: ProjectFrequency.once,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.approved,
      operationStatus: ProjectOperationStatus.notStarted,
      approvalMessage: 'Approved with clinic staff assigned to all medical stations.',
      image:
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Register at least 180 residents before the final consultation slot',
        'Keep non-medical volunteer roles clearly separated from clinical duties',
        'Collect follow-up consent for residents who need social support',
      ],
      sessions: [
        {
          name: 'Volunteer Briefing and Site Setup',
          offsetDays: 11,
          startTime: '19:00',
          endTime: '20:30',
        },
        {
          name: 'Morning Screening Shift',
          offsetDays: 12,
          startTime: '08:30',
          endTime: '12:00',
        },
        {
          name: 'Afternoon Screening Shift',
          offsetDays: 12,
          startTime: '12:30',
          endTime: '15:30',
        },
      ],
      positions: [
        {
          role: 'Registration Lead',
          description:
            'Welcome residents, verify appointment details, issue queue numbers, and flag urgent accessibility needs to staff.',
          totalSlots: 4,
          skills: ['Clear Communication', 'Data Accuracy', 'Warm Hospitality'],
        },
        {
          role: 'Care Navigator',
          description:
            'Guide residents between stations, explain next steps in plain language, and record consent for follow-up calls.',
          totalSlots: 6,
          skills: ['Active Listening', 'Basic Mandarin or Malay', 'Confidentiality'],
        },
        {
          role: 'Logistics Runner',
          description:
            'Keep screening stations stocked, manage signage, and coordinate lunch and rest breaks for volunteers.',
          totalSlots: 3,
          skills: ['Coordination', 'Manual Handling', 'Problem Solving'],
        },
      ],
    },
    {
      title: 'Youth Learning Lab Mentorship',
      managerEmail: 'gm@siloam.org',
      approverEmail: 'gm@siloam.org',
      location: 'Jurong Spring Community Hub, Singapore',
      aboutDesc:
        'A six-week Saturday mentorship lab pairing secondary school students with trained volunteers for study planning and confidence building.',
      objectives:
        'Help students set realistic study goals, practise problem-solving habits, and build trusted adult support outside school.',
      beneficiaries: 'Secondary 1 to 3 students from partner family service centres',
      initiatorName: 'Siloam Youth Programmes',
      organisingTeam: 'Youth Mentorship Team',
      proposedPlan:
        'Weekly small-group sessions combine study skills, subject coaching, reflection, and caregiver check-ins at weeks three and six.',
      startOffsetDays: 18,
      endOffsetDays: 60,
      startTime: '09:30',
      endTime: '12:30',
      frequency: ProjectFrequency.weekly,
      interval: 1,
      dayOfWeek: 'Saturday',
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.approved,
      operationStatus: ProjectOperationStatus.ongoing,
      approvalMessage: 'Approved for a capped pilot intake of 24 students.',
      image:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Match each student with a consistent mentor for the full six weeks',
        'Track attendance and study goals after every session',
        'Escalate wellbeing concerns to programme staff within the same day',
      ],
      sessions: [
        {
          name: 'Mentor Orientation',
          offsetDays: 15,
          startTime: '19:30',
          endTime: '21:00',
        },
        {
          name: 'Week 1 Learning Lab',
          offsetDays: 18,
          startTime: '09:30',
          endTime: '12:30',
        },
        {
          name: 'Week 2 Learning Lab',
          offsetDays: 25,
          startTime: '09:30',
          endTime: '12:30',
        },
        {
          name: 'Week 3 Caregiver Check-in',
          offsetDays: 32,
          startTime: '09:30',
          endTime: '12:30',
        },
      ],
      positions: [
        {
          role: 'Subject Mentor',
          description:
            'Support two to three students in study planning, homework review, and weekly goal reflection.',
          totalSlots: 10,
          skills: ['Mentoring', 'Teaching', 'Youth Engagement'],
        },
        {
          role: 'Activity Facilitator',
          description:
            'Lead opening activities, manage group transitions, and help mentors keep sessions on time.',
          totalSlots: 3,
          skills: ['Facilitation', 'Group Management', 'Timekeeping'],
        },
        {
          role: 'Attendance Coordinator',
          description:
            'Track student arrivals, update caregiver contact notes, and prepare weekly attendance summaries.',
          totalSlots: 2,
          skills: ['Administration', 'Spreadsheet Reporting', 'Discretion'],
        },
      ],
    },
    {
      title: 'Food Support Packing and Delivery',
      managerEmail: 'gm@siloam.org',
      approverEmail: 'subadmin@siloam.org',
      location: 'Bedok North Warehouse, Singapore',
      aboutDesc:
        'Pack and deliver monthly grocery bundles for families referred by partner social workers.',
      objectives:
        'Prepare accurate household-specific bundles, protect food safety, and complete deliveries with respectful doorstep interaction.',
      beneficiaries: 'Low-income households and isolated seniors in Bedok and Marine Parade',
      initiatorName: 'Siloam Family Support',
      organisingTeam: 'Relief Operations Team',
      proposedPlan:
        'Volunteers work from a verified packing list, split dry and chilled items, and complete route check-ins before close of day.',
      startOffsetDays: -24,
      endOffsetDays: -23,
      startTime: '08:00',
      endTime: '17:00',
      frequency: ProjectFrequency.once,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.approved,
      operationStatus: ProjectOperationStatus.completed,
      approvalMessage: 'Completed with all delivery routes closed.',
      image:
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Pack 260 household bundles with fewer than five packing corrections',
        'Complete all assigned delivery routes before 5pm',
        'Capture failed delivery notes for social worker follow-up',
      ],
      sessions: [
        {
          name: 'Packing Shift',
          offsetDays: -24,
          startTime: '08:00',
          endTime: '12:30',
        },
        {
          name: 'Delivery Dispatch',
          offsetDays: -24,
          startTime: '13:30',
          endTime: '17:00',
        },
        {
          name: 'Inventory Reconciliation',
          offsetDays: -23,
          startTime: '10:00',
          endTime: '12:00',
        },
      ],
      positions: [
        {
          role: 'Packing Crew',
          description:
            'Pack dry goods and household supplies according to route manifests and dietary notes.',
          totalSlots: 14,
          skills: ['Attention to Detail', 'Teamwork', 'Manual Handling'],
        },
        {
          role: 'Delivery Marshal',
          description:
            'Load vehicles, brief route teams, and update the operations channel when each route closes.',
          totalSlots: 4,
          skills: ['Route Planning', 'Coordination', 'Mobile Updates'],
        },
      ],
    },
    {
      title: 'Digital Skills Helpdesk for Seniors',
      managerEmail: 'gm@siloam.org',
      approverEmail: 'gm@siloam.org',
      location: 'Queenstown Public Library Programme Room, Singapore',
      aboutDesc:
        'A practical helpdesk where seniors can bring their phones for support with common digital services and scam-safe habits.',
      objectives:
        'Build confidence with everyday digital tasks while reinforcing privacy, consent, and scam awareness.',
      beneficiaries: 'Seniors aged 60 and above living around Queenstown',
      initiatorName: 'Siloam Digital Inclusion',
      organisingTeam: 'Community Learning Team',
      proposedPlan:
        'Small-group booths cover Singpass basics, messaging apps, photo storage, payment safety, and appointment booking.',
      startOffsetDays: 35,
      endOffsetDays: 35,
      startTime: '09:00',
      endTime: '13:00',
      frequency: ProjectFrequency.once,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.reviewing,
      operationStatus: ProjectOperationStatus.notStarted,
      approvalNotes: 'Pending confirmation of library room booking and device charging points.',
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Help at least 70 seniors complete one self-selected digital task',
        'Use a privacy-first script for all phone handling',
        'Provide printed scam-safety reminders in English, Mandarin, Malay, and Tamil',
      ],
      sessions: [
        {
          name: 'Helpdesk Setup and Volunteer Calibration',
          offsetDays: 35,
          startTime: '08:15',
          endTime: '09:00',
        },
        {
          name: 'Senior Digital Helpdesk',
          offsetDays: 35,
          startTime: '09:00',
          endTime: '13:00',
        },
      ],
      positions: [
        {
          role: 'Device Coach',
          description:
            'Sit one-to-one with seniors, talk through each tap before touching devices, and log requested follow-up topics.',
          totalSlots: 8,
          skills: ['Patient Coaching', 'Smartphone Basics', 'Privacy Awareness'],
        },
        {
          role: 'Helpdesk Greeter',
          description:
            'Manage appointment cards, direct walk-ins, and match residents to the right coaching booth.',
          totalSlots: 3,
          skills: ['Hospitality', 'Queue Management', 'Basic Translation'],
        },
      ],
    },
    {
      title: 'Befriending Phone Check-in Pilot',
      managerEmail: 'aisha.partner@siloam.org',
      approverEmail: 'subadmin@siloam.org',
      location: 'Remote with weekly debrief at Siloam office',
      aboutDesc:
        'A partner-proposed pilot for trained volunteers to make structured phone check-ins with isolated seniors.',
      objectives:
        'Test a consistent call script, escalation process, and volunteer debrief rhythm before scaling the programme.',
      beneficiaries: 'Isolated seniors referred by neighbourhood social workers',
      initiatorName: 'Nur Aisha Rahman',
      organisingTeam: 'Partner Volunteer Care Circle',
      proposedPlan:
        'Volunteers complete safeguarding training, make one weekly call to two matched seniors, and attend a debrief every fortnight.',
      startOffsetDays: 45,
      endOffsetDays: 101,
      startTime: '18:30',
      endTime: '20:30',
      frequency: ProjectFrequency.weekly,
      interval: 1,
      dayOfWeek: 'Wednesday',
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.pending,
      operationStatus: ProjectOperationStatus.notStarted,
      approvalNotes: 'Awaiting final safeguarding review.',
      image:
        'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Complete safeguarding training before any resident contact',
        'Pilot weekly calls with 20 seniors for eight weeks',
        'Review call logs for escalation quality and volunteer wellbeing',
      ],
      sessions: [
        {
          name: 'Safeguarding Training',
          offsetDays: 40,
          startTime: '19:00',
          endTime: '21:00',
        },
        {
          name: 'First Call Window',
          offsetDays: 45,
          startTime: '18:30',
          endTime: '20:30',
        },
      ],
      positions: [
        {
          role: 'Befriending Caller',
          description:
            'Make structured weekly calls, document wellbeing notes, and escalate concerns within the agreed response window.',
          totalSlots: 10,
          skills: ['Active Listening', 'Safeguarding', 'Clear Note Taking'],
        },
        {
          role: 'Debrief Facilitator',
          description:
            'Run fortnightly volunteer debriefs and identify support needs for callers handling difficult conversations.',
          totalSlots: 2,
          skills: ['Facilitation', 'Pastoral Sensitivity', 'Risk Escalation'],
        },
      ],
    },
  ];

  const volunteerProjectsByTitle: Record<
    string,
    Awaited<ReturnType<typeof upsertVolunteerProject>>
  > = {};
  for (const projectSeed of volunteerProjectSeeds) {
    volunteerProjectsByTitle[projectSeed.title] =
      await upsertVolunteerProject(projectSeed);
  }

  const findPosition = (projectTitle: string, role: string) => {
    const project = volunteerProjectsByTitle[projectTitle];
    const position = project.positions.find((item) => item.role === role);
    if (!position) {
      throw new Error(`Missing seeded position "${role}" for ${projectTitle}`);
    }
    return position;
  };

  const findSession = (projectTitle: string, name: string) => {
    const project = volunteerProjectsByTitle[projectTitle];
    const session = project.sessions.find((item) => item.name === name);
    if (!session) {
      throw new Error(`Missing seeded session "${name}" for ${projectTitle}`);
    }
    return session;
  };

  const volunteerAssignments = [
    {
      volunteerEmail: 'alicia.partner@siloam.org',
      projectTitle: 'Community Health Screening and Care Navigation',
      role: 'Registration Lead',
      status: VolunteerProjectPositionStatus.approved,
      availability: 'Can support briefing plus morning shift',
      approvedByEmail: 'gm@siloam.org',
      approvedOffsetDays: -2,
      approvalMessage: 'Assigned to registration because of prior school event experience.',
      sessions: [
        {
          name: 'Volunteer Briefing and Site Setup',
          hasRsvp: true,
          hasAttended: false,
        },
        {
          name: 'Morning Screening Shift',
          hasRsvp: true,
          hasAttended: false,
        },
      ],
    },
    {
      volunteerEmail: 'farah.partner@siloam.org',
      projectTitle: 'Community Health Screening and Care Navigation',
      role: 'Care Navigator',
      status: VolunteerProjectPositionStatus.approved,
      availability: 'Available full day if clinical lead needs extra translation support',
      approvedByEmail: 'gm@siloam.org',
      approvedOffsetDays: -3,
      approvalMessage: 'Approved for resident navigation and non-clinical guidance.',
      sessions: [
        {
          name: 'Volunteer Briefing and Site Setup',
          hasRsvp: true,
          hasAttended: false,
        },
        {
          name: 'Afternoon Screening Shift',
          hasRsvp: true,
          hasAttended: false,
        },
      ],
    },
    {
      volunteerEmail: 'rahul.partner@siloam.org',
      projectTitle: 'Youth Learning Lab Mentorship',
      role: 'Subject Mentor',
      status: VolunteerProjectPositionStatus.active,
      availability: 'All Saturday sessions except week four',
      approvedByEmail: 'gm@siloam.org',
      approvedOffsetDays: -7,
      approvalMessage: 'Approved for maths and study planning group.',
      sessions: [
        {
          name: 'Mentor Orientation',
          hasRsvp: true,
          hasAttended: true,
        },
        {
          name: 'Week 1 Learning Lab',
          hasRsvp: true,
          hasAttended: true,
        },
        {
          name: 'Week 2 Learning Lab',
          hasRsvp: true,
          hasAttended: false,
        },
      ],
    },
    {
      volunteerEmail: 'priya.partner@siloam.org',
      projectTitle: 'Youth Learning Lab Mentorship',
      role: 'Attendance Coordinator',
      status: VolunteerProjectPositionStatus.approved,
      availability: 'Can support attendance and caregiver notes remotely after sessions',
      approvedByEmail: 'gm@siloam.org',
      approvedOffsetDays: -5,
      approvalMessage: 'Approved for attendance workflow and caregiver messaging.',
      sessions: [
        {
          name: 'Mentor Orientation',
          hasRsvp: true,
          hasAttended: true,
        },
        {
          name: 'Week 1 Learning Lab',
          hasRsvp: true,
          hasAttended: true,
        },
      ],
    },
    {
      volunteerEmail: 'joshua.partner@siloam.org',
      projectTitle: 'Food Support Packing and Delivery',
      role: 'Delivery Marshal',
      status: VolunteerProjectPositionStatus.inactive,
      availability: 'Completed both packing and delivery dispatch',
      approvedByEmail: 'subadmin@siloam.org',
      approvedOffsetDays: -35,
      approvalMessage: 'Led vehicle loading and route closure updates.',
      sessions: [
        {
          name: 'Packing Shift',
          hasRsvp: true,
          hasAttended: true,
        },
        {
          name: 'Delivery Dispatch',
          hasRsvp: true,
          hasAttended: true,
        },
        {
          name: 'Inventory Reconciliation',
          hasRsvp: true,
          hasAttended: true,
        },
      ],
    },
    {
      volunteerEmail: 'aisha.partner@siloam.org',
      projectTitle: 'Food Support Packing and Delivery',
      role: 'Packing Crew',
      status: VolunteerProjectPositionStatus.inactive,
      availability: 'Completed packing shift',
      approvedByEmail: 'subadmin@siloam.org',
      approvedOffsetDays: -35,
      approvalMessage: 'Assigned to dietary restriction packing table.',
      sessions: [
        {
          name: 'Packing Shift',
          hasRsvp: true,
          hasAttended: true,
        },
      ],
    },
    {
      volunteerEmail: 'serene.donor@siloam.org',
      projectTitle: 'Befriending Phone Check-in Pilot',
      role: 'Befriending Caller',
      status: VolunteerProjectPositionStatus.reviewing,
      availability: 'Tuesday and Thursday afternoons; open to two matched seniors',
      sessions: [
        {
          name: 'Safeguarding Training',
          hasRsvp: true,
          hasAttended: false,
        },
      ],
    },
  ];

  for (const assignment of volunteerAssignments) {
    const volunteer = requireUser(assignment.volunteerEmail);
    const position = findPosition(assignment.projectTitle, assignment.role);
    const approver = assignment.approvedByEmail
      ? requireUser(assignment.approvedByEmail)
      : null;

    await prisma.volunteerProjectPosition.upsert({
      where: {
        volunteerId_positionId: {
          volunteerId: volunteer.id,
          positionId: position.id,
        },
      },
      update: {
        status: assignment.status,
        availability: assignment.availability,
        hasConsented: true,
        approvedAt:
          assignment.approvedOffsetDays === undefined
            ? null
            : addDays(anchorDate, assignment.approvedOffsetDays),
        approvedBy: approver?.id ?? null,
        approvalMessage: assignment.approvalMessage ?? null,
      },
      create: {
        volunteer: { connect: { id: volunteer.id } },
        position: { connect: { id: position.id } },
        status: assignment.status,
        availability: assignment.availability,
        hasConsented: true,
        approvedAt:
          assignment.approvedOffsetDays === undefined
            ? null
            : addDays(anchorDate, assignment.approvedOffsetDays),
        ...(approver ? { approver: { connect: { id: approver.id } } } : {}),
        approvalMessage: assignment.approvalMessage ?? null,
      },
    });

    for (const sessionSeed of assignment.sessions) {
      const session = findSession(assignment.projectTitle, sessionSeed.name);
      await prisma.volunteerSession.upsert({
        where: {
          volunteerId_sessionId: {
            volunteerId: volunteer.id,
            sessionId: session.id,
          },
        },
        update: {
          approvedAt:
            assignment.approvedOffsetDays === undefined
              ? null
              : addDays(anchorDate, assignment.approvedOffsetDays),
          approvedBy: approver?.id ?? null,
          has_rsvp: sessionSeed.hasRsvp,
          has_attended: sessionSeed.hasAttended,
        },
        create: {
          volunteer: { connect: { id: volunteer.id } },
          session: { connect: { id: session.id } },
          approvedAt:
            assignment.approvedOffsetDays === undefined
              ? null
              : addDays(anchorDate, assignment.approvedOffsetDays),
          ...(approver ? { approver: { connect: { id: approver.id } } } : {}),
          has_rsvp: sessionSeed.hasRsvp,
          has_attended: sessionSeed.hasAttended,
        },
      });
    }
  }

  const completedFoodProject =
    volunteerProjectsByTitle['Food Support Packing and Delivery'];
  const existingFoodFeedback = await prisma.volunteerProjectFeedback.findFirst({
    where: { projectId: completedFoodProject.id },
  });
  const foodFeedback = existingFoodFeedback
    ? await prisma.volunteerProjectFeedback.update({
      where: { id: existingFoodFeedback.id },
      data: {
        overallRating: 5,
        managementRating: 5,
        planningRating: 4,
        resourcesRating: 4,
        enjoyMost:
          'The route manifests were clear and the warehouse team handled last-minute substitutions calmly.',
        improvements:
          'A second barcode scanner at the chilled goods table would reduce the end-of-shift queue.',
        otherComments:
          'Beneficiary notes were specific enough for volunteers to prepare respectful doorstep interactions.',
      },
    })
    : await prisma.volunteerProjectFeedback.create({
      data: {
        project: { connect: { id: completedFoodProject.id } },
        overallRating: 5,
        managementRating: 5,
        planningRating: 4,
        resourcesRating: 4,
        enjoyMost:
          'The route manifests were clear and the warehouse team handled last-minute substitutions calmly.',
        improvements:
          'A second barcode scanner at the chilled goods table would reduce the end-of-shift queue.',
        otherComments:
          'Beneficiary notes were specific enough for volunteers to prepare respectful doorstep interactions.',
      },
    });

  await prisma.volunteerProjectPosition.update({
    where: {
      volunteerId_positionId: {
        volunteerId: requireUser('joshua.partner@siloam.org').id,
        positionId: findPosition(
          'Food Support Packing and Delivery',
          'Delivery Marshal',
        ).id,
      },
    },
    data: {
      volunteerProjectFeedbackId: foodFeedback.id,
    },
  });

  const peerFeedbackSeeds = [
    {
      reviewerEmail: 'aisha.partner@siloam.org',
      revieweeEmail: 'joshua.partner@siloam.org',
      projectTitle: 'Food Support Packing and Delivery',
      type: PartnerFeedbackType.peer,
      score: 5,
      strengths:
        'Joshua kept the delivery teams calm, checked every route twice, and gave clear updates when two addresses changed.',
      improvements:
        'Could delegate the final stock count earlier so route leads can leave on time.',
      tagSlugs: ['reliable', 'calm-under-pressure', 'detail-oriented'],
    },
    {
      reviewerEmail: 'joshua.partner@siloam.org',
      revieweeEmail: 'aisha.partner@siloam.org',
      projectTitle: 'Food Support Packing and Delivery',
      type: PartnerFeedbackType.peer,
      score: 4,
      strengths:
        'Aisha noticed dietary restriction labels that others missed and helped newer volunteers feel settled.',
      improvements:
        'Would be even stronger with a quick table reset checklist before the rush period.',
      tagSlugs: ['team-player', 'warm-communicator', 'detail-oriented'],
    },
    {
      reviewerEmail: 'priya.partner@siloam.org',
      revieweeEmail: 'rahul.partner@siloam.org',
      projectTitle: 'Youth Learning Lab Mentorship',
      type: PartnerFeedbackType.peer,
      score: 4,
      strengths:
        'Rahul translates study planning into simple steps and gives students space to try before stepping in.',
      improvements:
        'Could share a short written recap after each session for absent students.',
      tagSlugs: ['reliable', 'warm-communicator', 'team-player'],
    },
  ];

  for (const feedback of peerFeedbackSeeds) {
    const reviewer = requireUser(feedback.reviewerEmail);
    const reviewee = requireUser(feedback.revieweeEmail);
    const project = volunteerProjectsByTitle[feedback.projectTitle];

    await prisma.peerFeedback.upsert({
      where: {
        reviewerId_revieweeId_projectId_type: {
          reviewerId: reviewer.id,
          revieweeId: reviewee.id,
          projectId: project.id,
          type: feedback.type,
        },
      },
      update: {
        score: feedback.score,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        tags: {
          deleteMany: {},
          create: feedback.tagSlugs.map((slug) => ({
            tag: { connect: { id: tagsBySlug[slug].id } },
          })),
        },
      },
      create: {
        reviewer: { connect: { id: reviewer.id } },
        reviewee: { connect: { id: reviewee.id } },
        project: { connect: { id: project.id } },
        type: feedback.type,
        score: feedback.score,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        tags: {
          create: feedback.tagSlugs.map((slug) => ({
            tag: { connect: { id: tagsBySlug[slug].id } },
          })),
        },
      },
    });
  }

  async function upsertDonationProject(seed: DonationProjectSeed) {
    const manager = requireUser(seed.managerEmail);
    const startDate = addDays(anchorDate, seed.startOffsetDays);
    const endDate = addDays(anchorDate, seed.endOffsetDays);
    const deadline =
      seed.deadlineOffsetDays === undefined || seed.deadlineOffsetDays === null
        ? null
        : addDays(anchorDate, seed.deadlineOffsetDays);
    const projectData = {
      title: seed.title,
      location: seed.location,
      about: seed.about,
      objectives: seed.objectives,
      beneficiaries: seed.beneficiaries,
      initiatorName: seed.initiatorName,
      organisingTeam: seed.organisingTeam,
      targetFund: seed.targetFund ? money(seed.targetFund) : null,
      brickSize: seed.brickSize ? money(seed.brickSize) : null,
      deadline,
      type: seed.type,
      startDate,
      endDate,
      submissionStatus: seed.submissionStatus,
      approvalStatus: seed.approvalStatus,
      operationStatus: seed.operationStatus,
      approvalNotes: seed.approvalNotes ?? null,
      image: seed.image,
      attachments: null,
    };

    const existing = await prisma.donationProject.findFirst({
      where: { title: seed.title },
      select: { id: true },
    });

    if (existing) {
      return prisma.donationProject.update({
        where: { id: existing.id },
        data: {
          ...projectData,
          projectManager: { connect: { id: manager.id } },
          objectivesList: {
            deleteMany: {},
            create: seed.objectivesList.map((objective, index) => ({
              objective,
              order: index + 1,
            })),
          },
        },
        include: { objectivesList: true },
      });
    }

    return prisma.donationProject.create({
      data: {
        ...projectData,
        projectManager: { connect: { id: manager.id } },
        objectivesList: {
          create: seed.objectivesList.map((objective, index) => ({
            objective,
            order: index + 1,
          })),
        },
      },
      include: { objectivesList: true },
    });
  }

  const donationProjectSeeds: DonationProjectSeed[] = [
    {
      title: 'Mobile Clinic Equipment Renewal',
      managerEmail: 'finance@siloam.org',
      location: 'Bedok and Tampines, Singapore',
      about:
        'Replace ageing portable diagnostic equipment used by Siloam clinic teams during community screening days.',
      objectives:
        'Fund portable blood pressure monitors, glucose meters, privacy screens, consumables, and calibration support for mobile clinic operations.',
      beneficiaries: 'Residents attending free community health screenings',
      initiatorName: 'Siloam Community Clinic',
      organisingTeam: 'Clinic Outreach and Finance Team',
      targetFund: '68000.00',
      brickSize: '50.00',
      deadlineOffsetDays: 75,
      type: ProjectType.brick,
      startOffsetDays: -20,
      endOffsetDays: 90,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.approved,
      operationStatus: ProjectOperationStatus.ongoing,
      approvalNotes: 'Budget reviewed against vendor quotations.',
      image:
        'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Purchase 12 portable blood pressure monitors and 10 glucose meter kits',
        'Replace privacy screens and consumables for four screening sites',
        'Cover calibration and storage costs for the first year',
      ],
    },
    {
      title: 'Youth Bursary and Mentorship Fund',
      managerEmail: 'finance@siloam.org',
      location: 'Singapore',
      about:
        'Provide targeted bursaries and structured mentorship support for students who are already enrolled in Siloam youth programmes.',
      objectives:
        'Reduce out-of-pocket education costs, support consistent attendance, and fund mentor training materials.',
      beneficiaries: 'Secondary school students from low-income households',
      initiatorName: 'Siloam Youth Programmes',
      organisingTeam: 'Scholarship Review Committee',
      targetFund: '90000.00',
      brickSize: null,
      deadlineOffsetDays: 120,
      type: ProjectType.sponsor,
      startOffsetDays: -5,
      endOffsetDays: 150,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.approved,
      operationStatus: ProjectOperationStatus.ongoing,
      approvalNotes: 'Approved with quarterly beneficiary reporting.',
      image:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Award need-based bursaries to 35 students for school expenses',
        'Fund mentor training, student workbooks, and caregiver check-ins',
        'Track attendance and academic goal progress through the programme cycle',
      ],
    },
    {
      title: 'Emergency Grocery Voucher Response',
      managerEmail: 'finance@siloam.org',
      location: 'Islandwide, Singapore',
      about:
        'Maintain a rapid-response voucher pool for households facing sudden job loss, medical bills, or delayed assistance.',
      objectives:
        'Issue short-term grocery support within five working days of verified referral.',
      beneficiaries: 'Families and seniors referred by partner social workers',
      initiatorName: 'Siloam Family Support',
      organisingTeam: 'Relief Operations Team',
      targetFund: '24000.00',
      brickSize: '25.00',
      deadlineOffsetDays: -3,
      type: ProjectType.brick,
      startOffsetDays: -90,
      endOffsetDays: -2,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.approved,
      operationStatus: ProjectOperationStatus.completed,
      approvalNotes: 'Closed after final reconciliation.',
      image:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Issue grocery vouchers to 160 verified households',
        'Prioritise households with children, seniors, or medical needs',
        'Reconcile redeemed vouchers with referral records within two weeks',
      ],
    },
    {
      title: 'Partner-Led Community Kitchen Upgrade',
      managerEmail: 'daniel.donor@siloam.org',
      location: 'Geylang Bahru, Singapore',
      about:
        'Upgrade a partner community kitchen that prepares weekly meals for seniors and migrant workers.',
      objectives:
        'Improve food safety, storage, and volunteer workflow before the year-end meal distribution period.',
      beneficiaries: 'Seniors, migrant workers, and kitchen volunteers',
      initiatorName: 'Daniel Tan',
      organisingTeam: 'Corporate Giving Circle',
      targetFund: '38000.00',
      brickSize: '100.00',
      deadlineOffsetDays: 100,
      type: ProjectType.partnerLed,
      startOffsetDays: 14,
      endOffsetDays: 130,
      submissionStatus: SubmissionStatus.submitted,
      approvalStatus: ProjectApprovalStatus.reviewing,
      operationStatus: ProjectOperationStatus.notStarted,
      approvalNotes: 'Finance team is reviewing vendor estimates and partner documents.',
      image:
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
      objectivesList: [
        'Replace two commercial refrigerators and one prep table',
        'Improve dry goods shelving and labelling for allergen control',
        'Train volunteer shift leads on updated food safety workflow',
      ],
    },
  ];

  const donationProjectsByTitle: Record<
    string,
    Awaited<ReturnType<typeof upsertDonationProject>>
  > = {};
  for (const projectSeed of donationProjectSeeds) {
    donationProjectsByTitle[projectSeed.title] =
      await upsertDonationProject(projectSeed);
  }

  const recurringDonationSeeds = [
    {
      key: 'daniel-mobile-clinic-monthly',
      donorEmail: 'daniel.donor@siloam.org',
      projectTitle: 'Mobile Clinic Equipment Renewal',
      type: DonationType.individual,
      paymentMode: 'Credit Card',
      scheduledAmount: '150.00',
      frequency: DonationFrequency.monthly,
      startOffsetDays: -60,
      nextOffsetDays: 10,
      status: RecurringDonationStatus.active,
      isActive: true,
      isAutoDeducted: true,
    },
    {
      key: 'serene-youth-bursary-biweekly',
      donorEmail: 'serene.donor@siloam.org',
      projectTitle: 'Youth Bursary and Mentorship Fund',
      type: DonationType.individual,
      paymentMode: 'PayNow',
      scheduledAmount: '75.00',
      frequency: DonationFrequency.biweekly,
      startOffsetDays: -28,
      nextOffsetDays: 7,
      status: RecurringDonationStatus.active,
      isActive: true,
      isAutoDeducted: false,
    },
  ];

  const recurringDonationsByKey: Record<string, { id: string }> = {};
  for (const recurringSeed of recurringDonationSeeds) {
    const donor = requireUser(recurringSeed.donorEmail);
    const project = donationProjectsByTitle[recurringSeed.projectTitle];
    const existingRecurring = await prisma.recurringDonation.findFirst({
      where: {
        donorId: donor.id,
        projectId: project.id,
        frequency: recurringSeed.frequency,
      },
    });
    const data = {
      donorId: donor.id,
      projectId: project.id,
      type: recurringSeed.type,
      paymentMode: recurringSeed.paymentMode,
      scheduledAmount: money(recurringSeed.scheduledAmount),
      frequency: recurringSeed.frequency,
      startDate: addDays(anchorDate, recurringSeed.startOffsetDays),
      nextDate: addDays(anchorDate, recurringSeed.nextOffsetDays),
      status: recurringSeed.status,
      isActive: recurringSeed.isActive,
      isAutoDeducted: recurringSeed.isAutoDeducted,
    };

    const recurringDonation = existingRecurring
      ? await prisma.recurringDonation.update({
        where: { id: existingRecurring.id },
        data,
      })
      : await prisma.recurringDonation.create({ data });
    recurringDonationsByKey[recurringSeed.key] = recurringDonation;
  }

  const donationSeeds = [
    {
      receipt: 'SX-CLINIC-2026-0001',
      donorEmail: 'daniel.donor@siloam.org',
      projectTitle: 'Mobile Clinic Equipment Renewal',
      recurringKey: 'daniel-mobile-clinic-monthly',
      type: DonationType.individual,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: '150.00',
      dateOffsetDays: -58,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-CLINIC-2026-0002',
      donorEmail: 'daniel.donor@siloam.org',
      projectTitle: 'Mobile Clinic Equipment Renewal',
      recurringKey: 'daniel-mobile-clinic-monthly',
      type: DonationType.individual,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: '150.00',
      dateOffsetDays: -28,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-CLINIC-2026-0003',
      donorEmail: 'mei.donor@siloam.org',
      projectTitle: 'Mobile Clinic Equipment Renewal',
      type: DonationType.corporate,
      countryOfResidence: 'Singapore',
      paymentMode: 'Bank Transfer',
      amount: '8500.00',
      dateOffsetDays: -18,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-CLINIC-2026-0004',
      donorEmail: 'hanwei.donor@siloam.org',
      projectTitle: 'Mobile Clinic Equipment Renewal',
      type: DonationType.corporate,
      countryOfResidence: 'Singapore',
      paymentMode: 'PayNow Corporate',
      amount: '3200.00',
      dateOffsetDays: -6,
      receiptStatus: DonationReceiptStatus.pending,
      isThankYouSent: false,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-YOUTH-2026-0001',
      donorEmail: 'serene.donor@siloam.org',
      projectTitle: 'Youth Bursary and Mentorship Fund',
      recurringKey: 'serene-youth-bursary-biweekly',
      type: DonationType.individual,
      countryOfResidence: 'Singapore',
      paymentMode: 'PayNow',
      amount: '75.00',
      dateOffsetDays: -26,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-YOUTH-2026-0002',
      donorEmail: 'serene.donor@siloam.org',
      projectTitle: 'Youth Bursary and Mentorship Fund',
      recurringKey: 'serene-youth-bursary-biweekly',
      type: DonationType.individual,
      countryOfResidence: 'Singapore',
      paymentMode: 'PayNow',
      amount: '75.00',
      dateOffsetDays: -12,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-YOUTH-2026-0003',
      donorEmail: 'priya.partner@siloam.org',
      projectTitle: 'Youth Bursary and Mentorship Fund',
      type: DonationType.fundraising,
      countryOfResidence: 'Singapore',
      paymentMode: 'Giving.sg Payout',
      amount: '4200.00',
      dateOffsetDays: -4,
      receiptStatus: DonationReceiptStatus.pending,
      isThankYouSent: false,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-GROCERY-2026-0001',
      donorEmail: 'mei.donor@siloam.org',
      projectTitle: 'Emergency Grocery Voucher Response',
      type: DonationType.corporate,
      countryOfResidence: 'Singapore',
      paymentMode: 'Bank Transfer',
      amount: '12000.00',
      dateOffsetDays: -82,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-GROCERY-2026-0002',
      donorEmail: 'daniel.donor@siloam.org',
      projectTitle: 'Emergency Grocery Voucher Response',
      type: DonationType.individual,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: '600.00',
      dateOffsetDays: -67,
      receiptStatus: DonationReceiptStatus.received,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      receipt: 'SX-KITCHEN-2026-0001',
      donorEmail: 'hanwei.donor@siloam.org',
      projectTitle: 'Partner-Led Community Kitchen Upgrade',
      type: DonationType.corporate,
      countryOfResidence: 'Singapore',
      paymentMode: 'Bank Transfer',
      amount: '5000.00',
      dateOffsetDays: -1,
      receiptStatus: DonationReceiptStatus.pending,
      isThankYouSent: false,
      isAdminNotified: true,
    },
  ];

  for (const donationSeed of donationSeeds) {
    const donor = requireUser(donationSeed.donorEmail);
    const project = donationProjectsByTitle[donationSeed.projectTitle];
    const recurringDonation = donationSeed.recurringKey
      ? recurringDonationsByKey[donationSeed.recurringKey]
      : null;
    const data = {
      donorId: donor.id,
      projectId: project.id,
      recurringDonationId: recurringDonation?.id ?? null,
      type: donationSeed.type,
      countryOfResidence: donationSeed.countryOfResidence,
      paymentMode: donationSeed.paymentMode,
      date: addDays(anchorDate, donationSeed.dateOffsetDays),
      amount: money(donationSeed.amount),
      receipt: donationSeed.receipt,
      submissionStatus: SubmissionStatus.submitted,
      receiptStatus: donationSeed.receiptStatus,
      isThankYouSent: donationSeed.isThankYouSent,
      isAdminNotified: donationSeed.isAdminNotified,
    };

    const existingDonation = await prisma.donationTransaction.findFirst({
      where: { receipt: donationSeed.receipt },
    });

    if (existingDonation) {
      await prisma.donationTransaction.update({
        where: { id: existingDonation.id },
        data,
      });
    } else {
      await prisma.donationTransaction.create({ data });
    }
  }

  const campaignSeeds = [
    {
      name: 'Clinic Screening Volunteer Final Briefing',
      creatorEmail: 'gm@siloam.org',
      senderAddress: 'volunteer@siloam.org',
      subject: 'Final briefing for Tampines health screening',
      previewText: 'Arrival timings, station leads, and resident care reminders.',
      body:
        'Thank you for serving at the Tampines screening day. Please review your shift timing, bring a water bottle, and check in with the station lead when you arrive.',
      status: EmailCampaignStatus.scheduled,
      scheduledOffsetDays: 7,
      audienceFilter: {
        projectTitle: 'Community Health Screening and Care Navigation',
        isActivePartner: true,
        minAge: 21,
        maxAge: 65,
        volunteerInterests: [InterestSlug.training, InterestSlug.teaching],
        volunteerSkills: ['Basic Health Screening', 'Clear Communication'],
        languages: ['English', 'Mandarin', 'Malay'],
      },
      emails: [
        {
          subject: 'Final briefing for Tampines health screening',
          previewText: 'Arrival timings, station leads, and resident care reminders.',
          body:
            'Your final volunteer briefing is ready. Please arrive 15 minutes before your shift and keep all resident information confidential.',
          status: EmailStatus.scheduled,
          scheduledOffsetDays: 7,
          isTest: false,
          recipients: [
            {
              recipientAddress: 'alicia.partner@siloam.org',
              type: EmailRecipientType.to,
              status: EmailRecipientStatus.scheduled,
            },
            {
              recipientAddress: 'farah.partner@siloam.org',
              type: EmailRecipientType.to,
              status: EmailRecipientStatus.scheduled,
            },
            {
              recipientAddress: 'gm@siloam.org',
              type: EmailRecipientType.cc,
              status: EmailRecipientStatus.scheduled,
            },
          ],
        },
      ],
    },
    {
      name: 'Youth Mentorship Week One Recap',
      creatorEmail: 'gm@siloam.org',
      senderAddress: 'youth@siloam.org',
      subject: 'Week one recap and mentor notes',
      previewText: 'Thank you for helping students settle into the learning lab.',
      body:
        'Week one is complete. Please review attendance notes, update student goals, and flag any follow-up support before the next session.',
      status: EmailCampaignStatus.sent,
      scheduledOffsetDays: -1,
      audienceFilter: {
        projectTitle: 'Youth Learning Lab Mentorship',
        isActivePartner: true,
        minAge: 21,
        maxAge: 60,
        volunteerInterests: [InterestSlug.teaching, InterestSlug.training],
        volunteerSkills: ['Mentoring', 'Teaching', 'Youth Engagement'],
        languages: ['English'],
      },
      emails: [
        {
          subject: 'Week one recap and mentor notes',
          previewText: 'Attendance notes and follow-up actions are ready.',
          body:
            'Thank you for a strong first session. Please submit student goal notes by Friday so the team can prepare week two materials.',
          status: EmailStatus.attempted,
          scheduledOffsetDays: -1,
          isTest: false,
          recipients: [
            {
              recipientAddress: 'rahul.partner@siloam.org',
              type: EmailRecipientType.to,
              status: EmailRecipientStatus.sent,
            },
            {
              recipientAddress: 'priya.partner@siloam.org',
              type: EmailRecipientType.to,
              status: EmailRecipientStatus.sent,
            },
          ],
        },
      ],
    },
    {
      name: 'Clinic Equipment Donor Stewardship',
      creatorEmail: 'finance@siloam.org',
      senderAddress: 'giving@siloam.org',
      subject: 'Your gift is renewing mobile clinic equipment',
      previewText: 'A short update on funded equipment and next procurement steps.',
      body:
        'Thank you for supporting the Mobile Clinic Equipment Renewal fund. We will share procurement milestones and screening dates as the project progresses.',
      status: EmailCampaignStatus.draft,
      scheduledOffsetDays: null,
      audienceFilter: {
        isActivePartner: true,
        minAge: 25,
        maxAge: 75,
        volunteerInterests: [InterestSlug.fundraise],
        volunteerSkills: ['Corporate Giving', 'Donor Stewardship'],
        languages: ['English'],
      },
      emails: [],
    },
  ];

  for (const campaignSeed of campaignSeeds) {
    const creator = requireUser(campaignSeed.creatorEmail);
    const audienceProjectId = campaignSeed.audienceFilter.projectTitle
      ? volunteerProjectsByTitle[campaignSeed.audienceFilter.projectTitle].id
      : null;
    const campaignData = {
      name: campaignSeed.name,
      senderAddress: campaignSeed.senderAddress,
      subject: campaignSeed.subject,
      previewText: campaignSeed.previewText,
      body: campaignSeed.body,
      status: campaignSeed.status,
      scheduledAt:
        campaignSeed.scheduledOffsetDays === null
          ? null
          : addDays(anchorDate, campaignSeed.scheduledOffsetDays),
    };
    const audienceCreateData = {
      projectId: audienceProjectId,
      isActivePartner: campaignSeed.audienceFilter.isActivePartner,
      minAge: campaignSeed.audienceFilter.minAge,
      maxAge: campaignSeed.audienceFilter.maxAge,
      volunteerInterests: campaignSeed.audienceFilter.volunteerInterests,
      volunteerSkills: campaignSeed.audienceFilter.volunteerSkills,
      languages: campaignSeed.audienceFilter.languages,
    };
    const audienceUpdateData = {
      projectId: audienceProjectId,
      isActivePartner: campaignSeed.audienceFilter.isActivePartner,
      minAge: campaignSeed.audienceFilter.minAge,
      maxAge: campaignSeed.audienceFilter.maxAge,
      volunteerInterests: {
        set: campaignSeed.audienceFilter.volunteerInterests,
      },
      volunteerSkills: {
        set: campaignSeed.audienceFilter.volunteerSkills,
      },
      languages: {
        set: campaignSeed.audienceFilter.languages,
      },
    };

    const existingCampaign = await prisma.emailCampaign.findFirst({
      where: { name: campaignSeed.name },
      select: { id: true },
    });

    const campaign = existingCampaign
      ? await prisma.emailCampaign.update({
        where: { id: existingCampaign.id },
        data: {
          ...campaignData,
          creator: { connect: { id: creator.id } },
          audienceFilter: {
            upsert: {
              update: audienceUpdateData,
              create: audienceCreateData,
            },
          },
        },
      })
      : await prisma.emailCampaign.create({
        data: {
          ...campaignData,
          creator: { connect: { id: creator.id } },
          audienceFilter: {
            create: audienceCreateData,
          },
        },
      });

    for (const emailSeed of campaignSeed.emails) {
      const existingEmail = await prisma.email.findFirst({
        where: {
          campaignId: campaign.id,
          subject: emailSeed.subject,
        },
      });
      const emailData = {
        senderAddress: campaignSeed.senderAddress,
        subject: emailSeed.subject,
        previewText: emailSeed.previewText,
        body: emailSeed.body,
        status: emailSeed.status,
        scheduledAt:
          emailSeed.scheduledOffsetDays === null
            ? null
            : addDays(anchorDate, emailSeed.scheduledOffsetDays),
        isTest: emailSeed.isTest,
      };

      if (existingEmail) {
        await prisma.email.update({
          where: { id: existingEmail.id },
          data: {
            ...emailData,
            recipients: {
              deleteMany: {},
              create: emailSeed.recipients,
            },
          },
        });
      } else {
        await prisma.email.create({
          data: {
            ...emailData,
            campaign: { connect: { id: campaign.id } },
            recipients: {
              create: emailSeed.recipients,
            },
          },
        });
      }
    }
  }

  console.log('Realistic demo seed completed.');
  console.log('Demo credentials use password: password');
  console.log(
    `Seeded ${usersData.length} users, ${partnerProfiles.length} partner profiles, ${volunteerProjectSeeds.length} volunteer projects, ${donationProjectSeeds.length} donation projects, and ${donationSeeds.length} donation transactions.`,
  );
}

main()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
