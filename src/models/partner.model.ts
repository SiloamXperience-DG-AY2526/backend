import { Prisma } from '@prisma/client';
import type { Gender, ContactModeType, InterestSlug, ReferrerType, User } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { prisma } from '../prisma/client';
import { PartnerProfile } from '../schemas/user';
import { splitPartnerProfile } from '../utils/profile';

export async function findUserByEmailWithRoles(email: string) {
  return prisma.user.findUnique({
    where: { email },
  }) as Promise<User | null>;
}

export async function findUserByIdWithRoles(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError(`User ${id} not found!`);
  }

  return user;
}

export type PartnerData = {
  countryCode: string;
  contactNumber: string;
  dob?: Date;
  nationality?: string;
  occupation?: string;
  gender: Gender;
  residentialAddress?: string;
  emergencyCountryCode?: string;
  emergencyContactNumber?: string;
  identificationNumber?: string;
  otherInterests?: string;
  otherReferrers?: string;
  otherContactModes?: string;
  hasVolunteerExperience?: boolean;
  volunteerAvailability: string;
  isActive?: boolean;
  consentUpdatesCommunications: boolean;
  subscribeNewsletterEvents?: boolean;
  // related lists
  skills?: string[];
  languages?: string[];
  contactModes?: ContactModeType[];
  interests?: InterestSlug[];
  referrers?: ReferrerType[];
  // optional trip form
  tripForm?: {
    fullName: string;
    passportNumber: string;
    passportExpiry: Date;
    healthDeclaration?: string;
  };
};

export async function createPartnerWithUser(
  tx: Prisma.TransactionClient,
  userId: string,
  partnerData: PartnerData
) {
  const partnerCreateData: any = {
    user: { connect: { id: userId } },
  };

  const scalarFields = [
    'dob',
    'countryCode',
    'contactNumber',
    'emergencyCountryCode',
    'emergencyContactNumber',
    'identificationNumber',
    'nationality',
    'occupation',
    'gender',
    'residentialAddress',
    'otherInterests',
    'otherReferrers',
    'otherContactModes',
    'hasVolunteerExperience',
    'volunteerAvailability',
    'isActive',
    'consentUpdatesCommunications',
    'subscribeNewsletterEvents',
  ];

  for (const key of scalarFields) {
    if (partnerData && (partnerData as any)[key] !== undefined) {
      if (key === 'dob' && (partnerData as any)[key]) {
        partnerCreateData[key] = new Date((partnerData as any)[key]);
      } else {
        partnerCreateData[key] = (partnerData as any)[key];
      }
    }
  }

  if (Array.isArray(partnerData?.skills) && partnerData.skills.length) {
    partnerCreateData.skills = { create: partnerData.skills.map((s) => ({ skill: s })) };
  }
  if (Array.isArray(partnerData?.languages) && partnerData.languages.length) {
    partnerCreateData.languages = { create: partnerData.languages.map((l) => ({ language: l })) };
  }
  if (Array.isArray(partnerData?.contactModes) && partnerData.contactModes.length) {
    partnerCreateData.contactModes = { create: partnerData.contactModes.map((m) => ({ mode: m })) };
  }
  if (Array.isArray(partnerData?.interests) && partnerData.interests.length) {
    partnerCreateData.interests = { create: partnerData.interests.map((i) => ({ interestSlug: i })) };
  }
  if (Array.isArray(partnerData?.referrers) && partnerData.referrers.length) {
    partnerCreateData.referrers = { create: partnerData.referrers.map((r) => ({ referrer: r })) };
  }

  const partner = await tx.partner.create({ data: partnerCreateData });
  // If tripForm provided, create it and link to partner
  if (partnerData?.tripForm) {
    const tf = await tx.tripForm.create({
      data: {
        fullName: partnerData.tripForm.fullName,
        passportNumber: partnerData.tripForm.passportNumber,
        passportExpiry: partnerData.tripForm.passportExpiry,
        healthDeclaration: partnerData.tripForm.healthDeclaration,
        partner: { connect: { id: partner.id } },
      },
    });

    // Update partner.tripFormId to point to created trip form
    await tx.partner.update({ where: { id: partner.id }, data: { tripFormId: tf.id } });
  }

  return partner;
}

export async function createUserWithPartner(
  firstName: string,
  lastName: string,
  email: string,
  passwordHash: string,
  partnerData: PartnerData
) {

  // Check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Account already exists');
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        // role defaults to 'partner' via schema default
      },
    });

    await createPartnerWithUser(tx, user.id, partnerData);

    return user;
  });

  return result;
}

export const getPartnerProfile = async (
  userId: string
): Promise<PartnerProfile | null> => {
  const partner = await prisma.partner.findUnique({
    where: { userId: userId },
    select: {
      // User relation
      user: {
        select: {
          firstName: true,
          lastName: true,
          title: true,
          email: true,
        },
      },

      // scalar Partner fields
      dob: true,
      countryCode: true,
      contactNumber: true,
      emergencyCountryCode: true,
      emergencyContactNumber: true,
      identificationNumber: true,
      nationality: true,
      occupation: true,
      gender: true,
      residentialAddress: true,

      otherInterests: true,
      otherReferrers: true,
      otherContactModes: true,

      hasVolunteerExperience: true,
      volunteerAvailability: true,
      isActive: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,

      // other relations
      skills: { select: { skill: true } },
      languages: { select: { language: true } },
      contactModes: { select: { mode: true } },
      interests: { select: { interestSlug: true } },
    },
  });

  if (!partner) throw new BadRequestError('Error retrieving Partner profile');

  return {
    // flatten user relation fields
    firstName: partner.user.firstName,
    lastName: partner.user.lastName,
    email: partner.user.email,
    title: partner.user.title ?? undefined,

    // partner scalars
    dob: partner.dob ?? undefined,
    countryCode: partner.countryCode,
    contactNumber: partner.contactNumber,
    emergencyCountryCode: partner.emergencyCountryCode,
    emergencyContactNumber: partner.emergencyContactNumber,
    identificationNumber: partner.identificationNumber,
    nationality: partner.nationality,
    occupation: partner.occupation,
    gender: partner.gender,
    residentialAddress: partner.residentialAddress,

    otherInterests: partner.otherInterests,
    otherReferrers: partner.otherReferrers,
    otherContactModes: partner.otherContactModes,

    hasVolunteerExperience: partner.hasVolunteerExperience,
    volunteerAvailability: partner.volunteerAvailability,
    isActive: partner.isActive,
    consentUpdatesCommunications: partner.consentUpdatesCommunications,
    subscribeNewsletterEvents: partner.subscribeNewsletterEvents,

    // partner relations (arrays)
    skills: partner.skills.map((s) => s.skill),
    languages: partner.languages.map((l) => l.language),
    contactModes: partner.contactModes.map((c) => c.mode),
    interests: partner.interests.map((i) => i.interestSlug),
  };
};

export async function updatePartnerProfile(
  userId: string,
  newPartnerProfile: PartnerProfile
) {
  const { userOnlyProfile, partnerOnlyProfile } = splitPartnerProfile(newPartnerProfile);

  // separate scalar and relation fields
  const { skills, languages, contactModes, interests, ...partnerScalars } = partnerOnlyProfile;

  await prisma.partner.update({
    where: { userId },
    data: {
      // update the scalar fields of User relation
      user: { update: userOnlyProfile },

      // update scalar Partner fields
      ...partnerScalars,

      // update other relations
      skills: {
        deleteMany: {},
        create: skills.map((skill) => ({ skill })),
      },

      languages: {
        deleteMany: {},
        create: languages.map((language) => ({ language })),
      },

      contactModes: {
        deleteMany: {},
        create: contactModes.map((mode) => ({ mode })),
      },

      interests: {
        deleteMany: {},
        create: interests.map((interestSlug) => ({ interestSlug })),
      },
    },
  });

  const updatedProfile = await getPartnerProfile(userId);

  return updatedProfile;
}