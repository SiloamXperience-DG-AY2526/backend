import { Prisma } from '@prisma/client';
import type { Gender, ContactModeType, InterestSlug, ReferrerType, User } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { prisma } from '../prisma/client';
import { PartnerProfile } from '../schemas/user';
import { splitPartnerProfile } from '../utils/profile';

export async function findUserByEmailWithRoles(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      passwordHash: true,
      role: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findUserByIdWithRoles(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      passwordHash: true,
      role: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        role: true,
        title: true,
        createdAt: true,
        updatedAt: true,
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

export const getComprehensivePartnerInfo = async (userId: string) => {
  // Get partner profile
  const partnerProfile = await getPartnerProfile(userId);
  if (!partnerProfile) {
    throw new NotFoundError('Partner not found');
  }

  // Get user to access volunteer-related data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Get all volunteer project positions (projects joined)
  const volunteerPositions = await prisma.volunteerProjectPosition.findMany({
    where: {
      volunteerId: userId,
      status: { in: ['approved', 'active'] },
    },
    include: {
      position: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  volunteerPositions;

  // Get all volunteer sessions with attendance data
  const volunteerSessions = await prisma.volunteerSession.findMany({
    where: {
      volunteerId: userId,
    },
    include: {
      session: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: {
        sessionDate: 'desc',
      },
    },
  });

  // Calculate hours for each session and group by project
  const projectMap = new Map<string, {
    projectId: string;
    projectTitle: string;
    sessions: Array<{
      sessionName: string;
      date: Date;
      startTime: Date;
      endTime: Date;
      attendance: 'Attended' | 'Did not attend' | 'Unknown';
      hoursCompleted: number;
    }>;
    totalHours: number;
  }>();

  volunteerSessions.forEach((vs: any) => {
    const projectId = vs.session.project.id;
    const projectTitle = vs.session.project.title;
    
    // Calculate hours
    const startTime = new Date(vs.session.startTime);
    const endTime = new Date(vs.session.endTime);
    const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const hoursCompleted = vs.has_attended === true ? hoursDiff : 0;

    // Determine attendance status
    let attendance: 'Attended' | 'Did not attend' | 'Unknown';
    if (vs.has_attended === true) {
      attendance = 'Attended';
    } else if (vs.has_attended === false) {
      attendance = 'Did not attend';
    } else {
      attendance = 'Unknown';
    }

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, {
        projectId,
        projectTitle,
        sessions: [],
        totalHours: 0,
      });
    }

    const projectData = projectMap.get(projectId)!;
    projectData.sessions.push({
      sessionName: vs.session.name,
      date: vs.session.sessionDate,
      startTime: startTime,
      endTime: endTime,
      attendance,
      hoursCompleted,
    });
    projectData.totalHours += hoursCompleted;
  });

  // Convert map to array and format for response
  const projects = Array.from(projectMap.values()).map((project) => ({
    projectId: project.projectId,
    projectTitle: project.projectTitle,
    sessions: project.sessions.map((session) => ({
      sessionName: session.sessionName,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      attendance: session.attendance,
      hoursCompleted: Math.round(session.hoursCompleted * 100) / 100, // Round to 2 decimal places
    })),
    totalHours: Math.round(project.totalHours * 100) / 100,
  }));

  // Get performance reviews (PeerFeedback where this user is the reviewee)
  const performanceReviews = await prisma.peerFeedback.findMany({
    where: {
      revieweeId: userId,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Format performance reviews
  const performance = performanceReviews.map((review: any) => ({
    reviewerName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
    timestamp: review.createdAt,
    score: review.score,
    strengths: review.strengths,
    areasOfImprovement: review.improvements,
    projectTitle: review.project.title,
    feedbackType: review.type,
    tags: review.tags.map((ft: any) => ft.tag.name),
  }));

  // Format partnership interests (convert InterestSlug enum to readable format)
  const interestMap: Record<string, string> = {
    fundraise: 'Organizing fundraising events',
    planTrips: 'Planning trips for your organization/group',
    missionTrips: 'Short-term mission trips (up to 14 days)',
    longTerm: 'Long-term commitments (6 months or more)',
    admin: 'Behind-the-scenes administration',
    publicity: 'Marketing & social media magic',
    teaching: 'Teaching & mentoring',
    training: 'Training & program development',
    agriculture: 'Agriculture projects',
    building: 'Building & facilities work',
    others: 'Other',
  };

  const partnershipInterests = Object.entries(interestMap).map(([slug, label]: [string, string]) => ({
    interest: label,
    interested: (partnerProfile.interests as string[]).includes(slug),
  }));

  // Add "Other" if otherInterests is provided
  if (partnerProfile.otherInterests) {
    partnershipInterests.push({
      interest: `Other: ${partnerProfile.otherInterests}`,
      interested: true,
    });
  }

  // Format personal particulars
  const personalParticulars = {
    fullName: `${partnerProfile.firstName} ${partnerProfile.lastName}`,
    prefixTitle: partnerProfile.title || '',
    birthday: partnerProfile.dob ? partnerProfile.dob.toLocaleDateString('en-GB') : '',
    gender: partnerProfile.gender,
    occupation: partnerProfile.occupation || '',
    nationality: partnerProfile.nationality || '',
    phoneNumber: `${partnerProfile.countryCode}${partnerProfile.contactNumber}`,
    preferredCommunicationMethod: partnerProfile.contactModes.length > 0 
      ? partnerProfile.contactModes[0] 
      : 'email',
  };

  return {
    personalParticulars,
    projects,
    partnershipInterests,
    performance,
    profile: partnerProfile,
  };
};
