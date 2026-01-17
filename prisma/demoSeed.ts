import {
  Prisma,
  PrismaClient,
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

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function withTime(base: Date, time: string) {
  // Validate time format (HH:MM or H:MM)
  if (!/^\d{1,2}:\d{1,2}$/.test(time)) {
    throw new Error(`Invalid time format: ${time}. Expected format: HH:MM or H:MM`);
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  
  // Validate parsed values
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${time}. Hours must be 0-23, minutes must be 0-59`);
  }
  
  const date = new Date(base);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main() {
  console.log('🌱 Seeding demo data...');

  const today = new Date();

  // NOTE: These passwords are for DEMO/TESTING purposes only.
  // DO NOT use in production environments.
  const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD || 'DemoPass2024!Siloam';
  
  const usersData = [
    {
      email: 'superadmin@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Siloam',
      lastName: 'Admin',
      title: 'System Administrator',
      role: UserRole.superAdmin,
    },
    {
      email: 'gm@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Grace',
      lastName: 'Tan',
      title: 'General Manager',
      role: UserRole.generalManager,
    },
    {
      email: 'finance@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Felix',
      lastName: 'Ng',
      title: 'Finance Manager',
      role: UserRole.financeManager,
    },
    {
      email: 'alicia.partner@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Alicia',
      lastName: 'Lim',
      title: 'Community Partner',
      role: UserRole.partner,
    },
    {
      email: 'rahul.partner@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Rahul',
      lastName: 'Singh',
      title: 'Volunteer Mentor',
      role: UserRole.partner,
    },
    {
      email: 'aisha.partner@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Nur',
      lastName: 'Aisha',
      title: 'Program Assistant',
      role: UserRole.partner,
    },
    {
      email: 'daniel.donor@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Daniel',
      lastName: 'Tan',
      title: 'Individual Donor',
      role: UserRole.partner,
    },
    {
      email: 'mei.donor@siloam.org',
      password: DEMO_PASSWORD,
      firstName: 'Mei',
      lastName: 'Chen',
      title: 'Corporate Donor',
      role: UserRole.partner,
    },
  ];

  // Batch load existing users
  const userEmails = usersData.map((u) => u.email);
  const existingUsers = await prisma.user.findMany({
    where: {
      email: { in: userEmails },
    },
  });

  const usersByEmail: Record<string, { id: string; email: string }> = {};
  for (const existing of existingUsers) {
    usersByEmail[existing.email] = existing;
  }

  // Determine which users need to be created
  const usersToCreate = usersData.filter((userData) => !usersByEmail[userData.email]);

  if (usersToCreate.length > 0) {
    // Hash passwords in parallel for users to be created
    const passwordHashes = await Promise.all(
      usersToCreate.map((userData) => hashPassword(userData.password)),
    );

    const createManyData: Prisma.UserCreateManyInput[] = usersToCreate.map((userData, index) => ({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      passwordHash: passwordHashes[index],
      role: userData.role,
      title: userData.title,
    }));

    await prisma.user.createMany({
      data: createManyData,
      skipDuplicates: true,
    });
  }

  // Reload all relevant users to ensure usersByEmail is fully populated
  const allSeededUsers = await prisma.user.findMany({
    where: {
      email: { in: userEmails },
    },
  });

  for (const user of allSeededUsers) {
    usersByEmail[user.email] = user;
  }

  // NOTE: All contact numbers and identification numbers below are FAKE
  // and for demo/testing purposes only.
  const partnerProfiles = [
    {
      email: 'alicia.partner@siloam.org',
      dob: new Date('1991-04-12'),
      countryCode: '+65',
      contactNumber: '90000001', // Fake number
      emergencyCountryCode: '+65',
      emergencyContactNumber: '90000002', // Fake number
      identificationNumber: 'S0000001A', // Fake NRIC format
      nationality: 'Singaporean',
      occupation: 'Teacher',
      gender: Gender.female,
      residentialAddress: '123 Tampines Ave 1, Singapore 529123',
      volunteerAvailability: 'Weekends',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Teaching', 'Facilitation', 'Program Planning'],
      languages: ['English', 'Mandarin'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [InterestSlug.teaching, InterestSlug.training, InterestSlug.publicity],
      referrers: [ReferrerType.friend],
    },
    {
      email: 'rahul.partner@siloam.org',
      dob: new Date('1988-11-02'),
      countryCode: '+65',
      contactNumber: '90000003', // Fake number
      emergencyCountryCode: '+65',
      emergencyContactNumber: '90000004', // Fake number
      identificationNumber: 'S0000002B', // Fake NRIC format
      nationality: 'Indian',
      occupation: 'Engineer',
      gender: Gender.male,
      residentialAddress: '8 Jurong East St 21, Singapore 609602',
      volunteerAvailability: 'Weekday evenings',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: false,
      skills: ['Mentoring', 'Logistics', 'Teamwork'],
      languages: ['English', 'Tamil'],
      contactModes: [ContactModeType.email, ContactModeType.telegram],
      interests: [InterestSlug.planTrips, InterestSlug.admin],
      referrers: [ReferrerType.socialMedia],
    },
    {
      email: 'aisha.partner@siloam.org',
      dob: new Date('1995-07-08'),
      countryCode: '+65',
      contactNumber: '90000005', // Fake number
      emergencyCountryCode: '+65',
      emergencyContactNumber: '90000006', // Fake number
      identificationNumber: 'S0000003C', // Fake NRIC format
      nationality: 'Malaysian',
      occupation: 'Programme Executive',
      gender: Gender.female,
      residentialAddress: '55 Bedok North St 3, Singapore 460055',
      volunteerAvailability: 'Flexible',
      hasVolunteerExperience: false,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Coordination', 'Admin Support', 'Community Outreach'],
      languages: ['English', 'Malay'],
      contactModes: [ContactModeType.phoneCall, ContactModeType.messenger],
      interests: [InterestSlug.fundraise, InterestSlug.publicity, InterestSlug.others],
      referrers: [ReferrerType.event, ReferrerType.other],
      otherInterests: 'Community photography',
      otherReferrers: 'Volunteer fair',
      otherContactModes: 'SMS',
    },
  ];

  const partnersByEmail: Record<string, { id: string }> = {};
  for (const profile of partnerProfiles) {
    const user = usersByEmail[profile.email];
    if (!user) {
      continue;
    }

    const existingPartner = await prisma.partner.findUnique({
      where: { userId: user.id },
    });
    if (existingPartner) {
      partnersByEmail[profile.email] = existingPartner;
      continue;
    }

    const partner = await prisma.partner.create({
      data: {
        userId: user.id,
        dob: profile.dob,
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
        otherInterests: profile.otherInterests,
        otherReferrers: profile.otherReferrers,
        otherContactModes: profile.otherContactModes,
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
  }

  const aliciaPartner = partnersByEmail['alicia.partner@siloam.org'];
  if (aliciaPartner) {
    const existingTripForm = await prisma.tripForm.findUnique({
      where: { partnerId: aliciaPartner.id },
    });
    if (!existingTripForm) {
      await prisma.tripForm.create({
        data: {
          partnerId: aliciaPartner.id,
          fullName: 'Alicia Lim',
          passportNumber: 'E12345678',
          passportExpiry: new Date('2030-01-01'),
          healthDeclaration: 'No known chronic conditions.',
        },
      });
    }
  }

  const tagsData = [
    { name: 'Reliable', slug: 'reliable', color: '#2E7D32' },
    { name: 'Team Player', slug: 'team-player', color: '#1565C0' },
    { name: 'Communicator', slug: 'communicator', color: '#6A1B9A' },
  ];

  // Fetch all existing tags for these slugs in a single query
  const existingTags = await prisma.tag.findMany({
    where: {
      slug: {
        in: tagsData.map((tag) => tag.slug),
      },
    },
  });

  const tagsBySlug: Record<string, { id: string }> = {};
  for (const existingTag of existingTags) {
    tagsBySlug[existingTag.slug] = existingTag;
  }

  // Create any missing tags in parallel
  const tagsToCreate = tagsData.filter((tag) => !tagsBySlug[tag.slug]);
  if (tagsToCreate.length > 0) {
    const createdTags = await Promise.all(
      tagsToCreate.map((tag) =>
        prisma.tag.create({
          data: {
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
          },
        })
      )
    );

    for (const createdTag of createdTags) {
      tagsBySlug[createdTag.slug] = createdTag;
    }
  }

  // Validate that required users exist before creating projects
  const generalManager = usersByEmail['gm@siloam.org'];
  if (!generalManager) {
    throw new Error(
      "Required user 'gm@siloam.org' (generalManager) not found. Ensure user seeding runs successfully before creating volunteer projects."
    );
  }
  
  const volunteerProjectBaseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  async function getOrCreateVolunteerProject(
    data: Prisma.VolunteerProjectUncheckedCreateInput
  ) {
    const existing = await prisma.volunteerProject.findFirst({
      where: { title: data.title },
      include: { positions: true, sessions: true },
    });
    if (existing) {
      return existing;
    }
    return prisma.volunteerProject.create({
      data,
      include: { positions: true, sessions: true },
    });
  }

  const healthProjectDate = addDays(volunteerProjectBaseDate, 7);
  const healthProject = await getOrCreateVolunteerProject({
    managedById: generalManager.id,
    approvedById: generalManager.id,
    title: 'Community Health Screening',
    location: 'Tampines, Singapore',
    aboutDesc:
      'Support registration, crowd flow, and logistics for a community health screening event.',
    objectives: 'Smooth on-site experience for seniors and families.',
    beneficiaries: 'Seniors and low-income families',
    initiatorName: 'Siloam Outreach',
    organisingTeam: 'Volunteer Ops Team',
    proposedPlan: 'Seeded demo plan for health screening outreach.',
    startDate: healthProjectDate,
    endDate: healthProjectDate,
    startTime: withTime(healthProjectDate, '09:00'),
    endTime: withTime(healthProjectDate, '13:00'),
    frequency: ProjectFrequency.once,
    interval: null,
    dayOfWeek: null,
    submissionStatus: 'submitted',
    approvalStatus: ProjectApprovalStatus.approved,
    operationStatus: ProjectOperationStatus.ongoing,
    approvalMessage: 'Approved for demo.',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    attachments: null,
    objectivesList: {
      create: [
        { objective: 'Reduce waiting time for screenings', order: 1 },
        { objective: 'Provide friendly guidance and support', order: 2 },
      ],
    },
    sessions: {
      create: [
        {
          name: 'Morning Screening Session',
          sessionDate: healthProjectDate,
          startTime: withTime(healthProjectDate, '09:00'),
          endTime: withTime(healthProjectDate, '11:00'),
        },
        {
          name: 'Late Morning Screening Session',
          sessionDate: healthProjectDate,
          startTime: withTime(healthProjectDate, '11:00'),
          endTime: withTime(healthProjectDate, '13:00'),
        },
      ],
    },
    positions: {
      create: [
        {
          role: 'Registration Support',
          description: 'Help register participants and guide them to stations.',
          totalSlots: 6,
          skills: {
            create: [
              { skill: 'Communication', order: 1 },
              { skill: 'Customer Service', order: 2 },
            ],
          },
        },
        {
          role: 'Logistics Assistant',
          description: 'Coordinate queues and distribute forms.',
          totalSlots: 4,
          skills: {
            create: [
              { skill: 'Coordination', order: 1 },
              { skill: 'Problem Solving', order: 2 },
            ],
          },
        },
      ],
    },
  });

  const mentorshipDate = addDays(volunteerProjectBaseDate, 21);
  const mentorshipProject = await getOrCreateVolunteerProject({
    managedById: generalManager.id,
    approvedById: generalManager.id,
    title: 'After-School Mentorship',
    location: 'Jurong East, Singapore',
    aboutDesc: 'Weekly mentorship sessions for secondary school students.',
    objectives: 'Provide guidance on study habits and growth mindset.',
    beneficiaries: 'Secondary school students',
    initiatorName: 'Siloam Youth',
    organisingTeam: 'Youth Outreach Team',
    proposedPlan: 'Recurring weekly mentorship sessions.',
    startDate: mentorshipDate,
    endDate: addDays(mentorshipDate, 28),
    startTime: withTime(mentorshipDate, '17:30'),
    endTime: withTime(mentorshipDate, '19:30'),
    frequency: ProjectFrequency.weekly,
    interval: 1,
    dayOfWeek: 'Saturday',
    submissionStatus: 'submitted',
    approvalStatus: ProjectApprovalStatus.approved,
    operationStatus: ProjectOperationStatus.ongoing,
    approvalMessage: 'Approved for pilot run.',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    attachments: null,
    objectivesList: {
      create: [
        { objective: 'Foster positive mentor relationships', order: 1 },
        { objective: 'Support academic goal setting', order: 2 },
      ],
    },
    sessions: {
      create: [
        {
          name: 'Mentorship Kickoff',
          sessionDate: mentorshipDate,
          startTime: withTime(mentorshipDate, '17:30'),
          endTime: withTime(mentorshipDate, '19:30'),
        },
        {
          name: 'Mentorship Follow-up',
          sessionDate: addDays(mentorshipDate, 7),
          startTime: withTime(addDays(mentorshipDate, 7), '17:30'),
          endTime: withTime(addDays(mentorshipDate, 7), '19:30'),
        },
      ],
    },
    positions: {
      create: [
        {
          role: 'Youth Mentor',
          description: 'Guide students through activities and discussions.',
          totalSlots: 8,
          skills: {
            create: [
              { skill: 'Mentoring', order: 1 },
              { skill: 'Empathy', order: 2 },
            ],
          },
        },
        {
          role: 'Session Facilitator',
          description: 'Facilitate group activities and ensure smooth flow.',
          totalSlots: 2,
          skills: {
            create: [
              { skill: 'Facilitation', order: 1 },
              { skill: 'Leadership', order: 2 },
            ],
          },
        },
      ],
    },
  });

  const warehouseDate = addDays(volunteerProjectBaseDate, -14);
  const warehouseProject = await getOrCreateVolunteerProject({
    managedById: generalManager.id,
    approvedById: generalManager.id,
    title: 'Warehouse Sorting Day',
    location: 'Bedok, Singapore',
    aboutDesc: 'Sort and package donations for distribution.',
    objectives: 'Prepare donation packs efficiently.',
    beneficiaries: 'Low-income households',
    initiatorName: 'Siloam Logistics',
    organisingTeam: 'Operations Team',
    proposedPlan: 'One-day sorting and packing drive.',
    startDate: warehouseDate,
    endDate: warehouseDate,
    startTime: withTime(warehouseDate, '08:30'),
    endTime: withTime(warehouseDate, '12:30'),
    frequency: ProjectFrequency.once,
    interval: null,
    dayOfWeek: null,
    submissionStatus: 'submitted',
    approvalStatus: ProjectApprovalStatus.approved,
    operationStatus: ProjectOperationStatus.completed,
    approvalMessage: 'Completed successfully.',
    image:
      'https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?auto=format&fit=crop&w=1200&q=80',
    attachments: null,
    objectivesList: {
      create: [
        { objective: 'Sort and label all incoming donations', order: 1 },
        { objective: 'Prepare 150 family packs', order: 2 },
      ],
    },
    sessions: {
      create: [
        {
          name: 'Sorting Shift',
          sessionDate: warehouseDate,
          startTime: withTime(warehouseDate, '08:30'),
          endTime: withTime(warehouseDate, '12:30'),
        },
      ],
    },
    positions: {
      create: [
        {
          role: 'Sorting Crew',
          description: 'Sort, label, and pack items.',
          totalSlots: 10,
          skills: {
            create: [
              { skill: 'Attention to Detail', order: 1 },
              { skill: 'Teamwork', order: 2 },
            ],
          },
        },
      ],
    },
  });

  const aliciaUser = usersByEmail['alicia.partner@siloam.org'];
  const rahulUser = usersByEmail['rahul.partner@siloam.org'];
  const aishaUser = usersByEmail['aisha.partner@siloam.org'];

  const healthRegistration = healthProject.positions.find(
    (position) => position.role === 'Registration Support'
  );
  const mentorshipMentor = mentorshipProject.positions.find(
    (position) => position.role === 'Youth Mentor'
  );
  const warehouseSorting = warehouseProject.positions.find(
    (position) => position.role === 'Sorting Crew'
  );

  if (healthRegistration && aliciaUser) {
    await prisma.volunteerProjectPosition.upsert({
      where: {
        volunteerId_positionId: {
          volunteerId: aliciaUser.id,
          positionId: healthRegistration.id,
        },
      },
      update: {},
      create: {
        volunteerId: aliciaUser.id,
        positionId: healthRegistration.id,
        status: VolunteerProjectPositionStatus.approved,
        hasConsented: true,
        approvedAt: new Date(),
        approvedBy: generalManager.id,
        approvalMessage: 'Approved for demo assignment.',
      },
    });
  }

  if (mentorshipMentor && rahulUser) {
    await prisma.volunteerProjectPosition.upsert({
      where: {
        volunteerId_positionId: {
          volunteerId: rahulUser.id,
          positionId: mentorshipMentor.id,
        },
      },
      update: {},
      create: {
        volunteerId: rahulUser.id,
        positionId: mentorshipMentor.id,
        status: VolunteerProjectPositionStatus.reviewing,
        hasConsented: true,
      },
    });
  }

  if (warehouseSorting && aishaUser) {
    await prisma.volunteerProjectPosition.upsert({
      where: {
        volunteerId_positionId: {
          volunteerId: aishaUser.id,
          positionId: warehouseSorting.id,
        },
      },
      update: {},
      create: {
        volunteerId: aishaUser.id,
        positionId: warehouseSorting.id,
        status: VolunteerProjectPositionStatus.active,
        hasConsented: true,
        approvedAt: addDays(today, -20),
        approvedBy: generalManager.id,
      },
    });
  }

  const healthSession = healthProject.sessions[0];
  const mentorshipSession = mentorshipProject.sessions[0];
  const warehouseSession = warehouseProject.sessions[0];

  if (healthSession && aliciaUser) {
    await prisma.volunteerSession.upsert({
      where: {
        volunteerId_sessionId: {
          volunteerId: aliciaUser.id,
          sessionId: healthSession.id,
        },
      },
      update: {},
      create: {
        volunteerId: aliciaUser.id,
        sessionId: healthSession.id,
        approvedAt: new Date(),
        approvedBy: generalManager.id,
        has_rsvp: true,
      },
    });
  }

  if (mentorshipSession && rahulUser) {
    await prisma.volunteerSession.upsert({
      where: {
        volunteerId_sessionId: {
          volunteerId: rahulUser.id,
          sessionId: mentorshipSession.id,
        },
      },
      update: {},
      create: {
        volunteerId: rahulUser.id,
        sessionId: mentorshipSession.id,
        approvedAt: new Date(),
        approvedBy: generalManager.id,
        has_rsvp: true,
      },
    });
  }

  if (warehouseSession && aishaUser) {
    await prisma.volunteerSession.upsert({
      where: {
        volunteerId_sessionId: {
          volunteerId: aishaUser.id,
          sessionId: warehouseSession.id,
        },
      },
      update: {},
      create: {
        volunteerId: aishaUser.id,
        sessionId: warehouseSession.id,
        approvedAt: addDays(today, -20),
        approvedBy: generalManager.id,
        has_rsvp: true,
        has_attended: true,
      },
    });
  }

  const existingProjectFeedback = await prisma.volunteerProjectFeedback.findFirst({
    where: { projectId: warehouseProject.id },
  });
  const projectFeedback =
    existingProjectFeedback ||
    (await prisma.volunteerProjectFeedback.create({
      data: {
        projectId: warehouseProject.id,
        overallRating: 5,
        managementRating: 5,
        planningRating: 4,
        resourcesRating: 4,
        enjoyMost: 'Working with the logistics team was smooth and energising.',
        improvements: 'More signage for sorting categories.',
        otherComments: 'Would join again.',
      },
    }));

  if (warehouseSorting && aishaUser) {
    await prisma.volunteerProjectPosition.update({
      where: {
        volunteerId_positionId: {
          volunteerId: aishaUser.id,
          positionId: warehouseSorting.id,
        },
      },
      data: {
        volunteerProjectFeedbackId: projectFeedback.id,
      },
    });
  }

  if (aliciaUser && rahulUser) {
    const existingFeedback = await prisma.peerFeedback.findUnique({
      where: {
        reviewerId_revieweeId_projectId_type: {
          reviewerId: aliciaUser.id,
          revieweeId: rahulUser.id,
          projectId: mentorshipProject.id,
          type: PartnerFeedbackType.peer,
        },
      },
    });

    if (!existingFeedback) {
      await prisma.peerFeedback.create({
        data: {
          reviewerId: aliciaUser.id,
          revieweeId: rahulUser.id,
          projectId: mentorshipProject.id,
          score: 4,
          type: PartnerFeedbackType.peer,
          strengths: 'Patient mentor with clear communication.',
          improvements: 'Could share more check-in resources.',
          tags: {
            create: [
              { tag: { connect: { id: tagsBySlug['communicator'].id } } },
              { tag: { connect: { id: tagsBySlug['team-player'].id } } },
            ],
          },
        },
      });
    }
  }

  async function getOrCreateDonationProject(
    data: Prisma.DonationProjectUncheckedCreateInput
  ) {
    const existing = await prisma.donationProject.findFirst({
      where: { title: data.title },
      include: { objectivesList: true },
    });
    if (existing) {
      return existing;
    }
    return prisma.donationProject.create({
      data,
      include: { objectivesList: true },
    });
  }

  // Validate that required users exist
  const financeManager = usersByEmail['finance@siloam.org'];
  if (!financeManager) {
    throw new Error(
      "Required user 'finance@siloam.org' (financeManager) not found. Ensure user seeding runs successfully before creating donation projects."
    );
  }

  const clinicProject = await getOrCreateDonationProject({
    managedBy: financeManager.id,
    title: 'Clinic Equipment Fund',
    location: 'Bedok, Singapore',
    about: 'Fundraising for new screening equipment at the Siloam Clinic.',
    objectives: 'Raise funds for diagnostic devices and supplies.',
    beneficiaries: 'Clinic patients',
    initiatorName: 'Siloam Clinic',
    organisingTeam: 'Fundraising Team',
    targetFund: new Prisma.Decimal('50000.00'),
    brickSize: new Prisma.Decimal('50.00'),
    deadline: addDays(today, 60),
    type: ProjectType.brick,
    startDate: addDays(today, -10),
    endDate: addDays(today, 90),
    submissionStatus: SubmissionStatus.submitted,
    approvalStatus: ProjectApprovalStatus.approved,
    approvalNotes: 'Approved by finance manager.',
    image:
      'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1200&q=80',
    attachments: null,
    objectivesList: {
      create: [
        { objective: 'Purchase diagnostic equipment', order: 1 },
        { objective: 'Upgrade screening supplies', order: 2 },
      ],
    },
  });

  const scholarshipProject = await getOrCreateDonationProject({
    managedBy: financeManager.id,
    title: 'Youth Scholarship Fund',
    location: 'Singapore',
    about: 'Support scholarships for underprivileged youth.',
    objectives: 'Fund tuition and mentorship support.',
    beneficiaries: 'Youth beneficiaries',
    initiatorName: 'Siloam Education',
    organisingTeam: 'Scholarship Committee',
    targetFund: new Prisma.Decimal('75000.00'),
    type: ProjectType.sponsor,
    startDate: addDays(today, -30),
    endDate: addDays(today, 120),
    submissionStatus: SubmissionStatus.submitted,
    approvalStatus: ProjectApprovalStatus.reviewing,
    approvalNotes: 'Under review.',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    attachments: null,
    objectivesList: {
      create: [
        { objective: 'Sponsor tuition fees', order: 1 },
        { objective: 'Provide mentorship support', order: 2 },
      ],
    },
  });

  // Validate that required donor users exist
  const donorDaniel = usersByEmail['daniel.donor@siloam.org'];
  if (!donorDaniel) {
    throw new Error(
      "Required user 'daniel.donor@siloam.org' not found. Ensure user seeding runs successfully before creating donations."
    );
  }
  
  const donorMei = usersByEmail['mei.donor@siloam.org'];
  if (!donorMei) {
    throw new Error(
      "Required user 'mei.donor@siloam.org' not found. Ensure user seeding runs successfully before creating donations."
    );
  }

  const existingRecurring = await prisma.recurringDonation.findFirst({
    where: {
      donorId: donorDaniel.id,
      projectId: clinicProject.id,
    },
  });

  const recurringDonation =
    existingRecurring ||
    (await prisma.recurringDonation.create({
      data: {
        donorId: donorDaniel.id,
        projectId: clinicProject.id,
        type: DonationType.individual,
        paymentMode: 'Credit Card',
        scheduledAmount: new Prisma.Decimal('120.00'),
        frequency: DonationFrequency.monthly,
        startDate: addDays(today, -30),
        nextDate: addDays(today, 30),
        status: RecurringDonationStatus.active,
      },
    }));

  const receiptOne = 'DEMO-CLINIC-0001';
  const existingTransaction = await prisma.donationTransaction.findFirst({
    where: { receipt: receiptOne },
  });
  if (!existingTransaction) {
    await prisma.donationTransaction.create({
      data: {
        donorId: donorDaniel.id,
        projectId: clinicProject.id,
        recurringDonationId: recurringDonation.id,
        type: DonationType.individual,
        countryOfResidence: 'Singapore',
        paymentMode: 'Credit Card',
        amount: new Prisma.Decimal('120.00'),
        receipt: receiptOne,
        submissionStatus: SubmissionStatus.submitted,
        receiptStatus: DonationReceiptStatus.received,
        isThankYouSent: true,
        isAdminNotified: true,
      },
    });
  }

  const receiptTwo = 'DEMO-SCHOLAR-0001';
  const existingTransactionTwo = await prisma.donationTransaction.findFirst({
    where: { receipt: receiptTwo },
  });
  if (!existingTransactionTwo) {
    await prisma.donationTransaction.create({
      data: {
        donorId: donorMei.id,
        projectId: scholarshipProject.id,
        type: DonationType.corporate,
        countryOfResidence: 'Singapore',
        paymentMode: 'Bank Transfer',
        amount: new Prisma.Decimal('5000.00'),
        receipt: receiptTwo,
        submissionStatus: SubmissionStatus.submitted,
        receiptStatus: DonationReceiptStatus.pending,
        isThankYouSent: false,
        isAdminNotified: true,
      },
    });
  }

  const campaignName = 'Volunteer Appreciation 2025';
  const existingCampaign = await prisma.emailCampaign.findFirst({
    where: { name: campaignName },
  });

  const campaign =
    existingCampaign ||
    (await prisma.emailCampaign.create({
      data: {
        name: campaignName,
        senderAddress: 'volunteer@siloam.org',
        subject: 'Thank you for serving with Siloam!',
        previewText: 'We appreciate your impact.',
        body: 'Thank you for supporting our community outreach initiatives.',
        status: EmailCampaignStatus.scheduled,
        scheduledAt: addDays(today, 5),
        createdBy: generalManager.id,
        audienceFilter: {
          create: {
            projectId: mentorshipProject.id,
            isActivePartner: true,
            gender: Gender.female,
            minAge: 21,
            maxAge: 45,
            volunteerInterests: [InterestSlug.teaching, InterestSlug.training],
            volunteerSkills: ['Teaching', 'Facilitation'],
            languages: ['English'],
          },
        },
      },
    }));

  const existingEmail = await prisma.email.findFirst({
    where: { subject: 'Volunteer Appreciation Reminder' },
  });

  const email =
    existingEmail ||
    (await prisma.email.create({
      data: {
        campaignId: campaign.id,
        senderAddress: 'volunteer@siloam.org',
        subject: 'Volunteer Appreciation Reminder',
        previewText: 'Your impact matters.',
        body: 'Thank you again for your dedication. See you at the next session!',
        status: EmailStatus.scheduled,
        scheduledAt: addDays(today, 5),
        isTest: false,
        recipients: {
          create: [
            {
              recipientAddress: 'alicia.partner@siloam.org',
              type: EmailRecipientType.to,
              status: EmailRecipientStatus.scheduled,
            },
            {
              recipientAddress: 'aisha.partner@siloam.org',
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
      },
    }));

  if (!existingEmail && email) {
    console.log(`✉️  Email scheduled: ${email.subject}`);
  }

  console.log('✅ Demo seed completed.');
}

main()
  .catch((error) => {
    console.error('❌ Demo seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
