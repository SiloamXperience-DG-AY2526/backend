import { Prisma } from '@prisma/client';
import type { Gender, ContactModeType, InterestSlug, ReferrerType, User } from '@prisma/client';
import { prisma } from '../prisma/client';

export type UserWithRoles = User & { roles: { role: { roleName: string } }[] };

export async function findUserByEmailWithRoles(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  }) as Promise<UserWithRoles | null>;
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
  if (email.endsWith('@siloamxperience.org')) {
    throw new Error('Staff accounts cannot sign up publicly');
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Account already exists');
  }

  const partnerRole = await prisma.role.findFirst({ where: { roleName: 'PARTNER' } });
  if (!partnerRole) {
    throw new Error('Partner role does not exist. Seed roles first.');
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        roles: {
          create: {
            role: { connect: { id: partnerRole.id } },
          },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    await createPartnerWithUser(tx, user.id, partnerData);

    return user;
  });

  return result;
}
