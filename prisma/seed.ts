import { PrismaClient, UserRole, Gender, ContactModeType, InterestSlug, ReferrerType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // ==================== USERS FOR ALL ROLES ====================
  const usersData = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@siloam.com',
      password: 'password',
      role: UserRole.superAdmin,
      title: 'System Administrator',
    },
    {
      firstName: 'General',
      lastName: 'Manager',
      email: 'generalmanager@siloam.com',
      password: 'password',
      role: UserRole.generalManager,
      title: 'General Manager',
    },
    {
      firstName: 'Finance',
      lastName: 'Manager',
      email: 'financemanager@siloam.com',
      password: 'password',
      role: UserRole.financeManager,
      title: 'Finance Manager',
    },
    {
      firstName: 'Partner',
      lastName: 'Partner',
      email: 'partner@siloam.com',
      password: 'password',
      role: UserRole.partner,
      title: 'Community Partner',
    },
  ];

  console.log('👤 Creating users for all roles...\n');

  const createdUsers: Record<string, any> = {};

  for (const userData of usersData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        createdUsers[userData.email] = existingUser;
        continue;
      }

      const passwordHash = await hashPassword(userData.password);

      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          passwordHash,
          role: userData.role,
          title: userData.title,
        },
      });

      createdUsers[userData.email] = user;
      console.log(`✅ Created ${userData.role}: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  // ==================== PARTNER PROFILES ====================
  console.log('\n👥 Creating partner profiles with complete onboarding data...\n');

  // const partnerEmails = ['partner@siloam.com'];
  const partnerProfiles = [
    {
      email: 'partner@siloam.com',
      dob: new Date('1990-05-15'),
      countryCode: '+65',
      contactNumber: '91234567',
      emergencyCountryCode: '+65',
      emergencyContactNumber: '98765432',
      identificationNumber: 'S9012345A',
      nationality: 'Singaporean',
      occupation: 'Software Engineer',
      gender: Gender.female,
      residentialAddress: '123 Orchard Road, #12-34, Singapore 238857',
      volunteerAvailability: 'Weekends and evenings',
      hasVolunteerExperience: true,
      consentUpdatesCommunications: true,
      subscribeNewsletterEvents: true,
      skills: ['Teaching', 'Event Planning', 'Communication'],
      languages: ['English', 'Mandarin'],
      contactModes: [ContactModeType.email, ContactModeType.whatsapp],
      interests: [InterestSlug.teaching, InterestSlug.admin, InterestSlug.publicity],
      referrers: [ReferrerType.friend, ReferrerType.socialMedia],
    },
  ];

  for (const profile of partnerProfiles) {
    try {
      const user = createdUsers[profile.email];
      if (!user) {
        console.log(`⚠️  User ${profile.email} not found, skipping partner profile...`);
        continue;
      }

      const existingPartner = await prisma.partner.findUnique({
        where: { userId: user.id },
      });

      if (existingPartner) {
        console.log(`⚠️  Partner profile for ${profile.email} already exists, skipping...`);
        continue;
      }

      await prisma.partner.create({
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
          skills: {
            create: profile.skills.map((skill) => ({
              skill,
            })),
          },
          languages: {
            create: profile.languages.map((language) => ({
              language,
            })),
          },
          contactModes: {
            create: profile.contactModes.map((mode) => ({
              mode,
            })),
          },
          interests: {
            create: profile.interests.map((interest) => ({
              interestSlug: interest,
            })),
          },
          referrers: {
            create: profile.referrers.map((referrer) => ({
              referrer,
            })),
          },
        },
      });

      console.log(`✅ Created partner profile for ${profile.email}`);
    } catch (error) {
      console.error(`❌ Error creating partner profile for ${profile.email}:`, error);
    }
  }

  // ==================== DONOR USERS ====================
  console.log('\n💰 Creating donor users...\n');

  const donorUsersData = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@email.com',
      password: 'password',
      role: UserRole.partner,
      title: 'Community Member',
    },
    {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@email.com',
      password: 'password',
      role: UserRole.partner,
      title: 'Business Owner',
    },
    {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@email.com',
      password: 'password',
      role: UserRole.partner,
      title: 'Teacher',
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@email.com',
      password: 'password',
      role: UserRole.partner,
      title: 'Engineer',
    },
    {
      firstName: 'Emma',
      lastName: 'Garcia',
      email: 'emma.garcia@email.com',
      password: 'password',
      role: UserRole.partner,
      title: 'Healthcare Worker',
    },
  ];

  for (const userData of donorUsersData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⚠️  Donor user ${userData.email} already exists, skipping...`);
        createdUsers[userData.email] = existingUser;
        continue;
      }

      const passwordHash = await hashPassword(userData.password);

      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          passwordHash,
          role: userData.role,
          title: userData.title,
        },
      });

      createdUsers[userData.email] = user;
      console.log(`✅ Created donor: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error creating donor user ${userData.email}:`, error);
    }
  }

  // ==================== DONATION PROJECTS ====================
  console.log('\n🏗️  Creating donation projects...\n');

  const donationProjectsData = [
    {
      managedBy: 'partner@siloam.com',
      title: 'School Supplies for Underprivileged Children',
      location: 'Singapore',
      about: 'Providing essential school supplies to children from low-income families in Singapore.',
      objectives: 'Distribute 500 sets of school supplies including notebooks, pencils, and backpacks.',
      beneficiaries: '500 underprivileged children aged 6-16',
      initiatorName: 'Community Education Initiative',
      organisingTeam: 'Local NGO Partners',
      targetFund: 15000,
      brickSize: 50,
      deadline: new Date('2026-06-30'),
      type: 'brick' as const,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-30'),
      submissionStatus: 'submitted' as const,
      approvalStatus: 'approved' as const,
      operationStatus: 'notStarted' as const,
      objectivesList: [
        'Procure quality school supplies from local vendors',
        'Distribute supplies to partner schools',
        'Track distribution and impact measurement'
      ],
    },
    {
      managedBy: 'partner@siloam.com',
      title: 'Community Garden Development',
      location: 'Singapore',
      about: 'Creating sustainable community gardens to promote healthy eating and community engagement.',
      objectives: 'Establish 3 community gardens with organic produce and educational programs.',
      beneficiaries: '300 local residents and families',
      initiatorName: 'Green Community Project',
      organisingTeam: 'Environmental Volunteers',
      targetFund: 25000,
      brickSize: 100,
      deadline: new Date('2026-08-15'),
      type: 'sponsor' as const,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-08-15'),
      submissionStatus: 'submitted' as const,
      approvalStatus: 'approved' as const,
      operationStatus: 'notStarted' as const,
      objectivesList: [
        'Secure land permissions for garden sites',
        'Purchase gardening tools and seeds',
        'Organize community workshops and training'
      ],
    },
    {
      managedBy: 'financemanager@siloam.com',
      title: 'Emergency Relief Fund for Natural Disasters',
      location: 'Southeast Asia',
      about: 'Providing immediate relief and recovery support to communities affected by natural disasters.',
      objectives: 'Deliver emergency supplies and rebuild infrastructure in disaster-affected areas.',
      beneficiaries: '1000 families in disaster-prone regions',
      initiatorName: 'Disaster Relief Coalition',
      organisingTeam: 'International Aid Partners',
      targetFund: 50000,
      brickSize: 200,
      deadline: new Date('2026-12-31'),
      type: 'partnerLed' as const,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      submissionStatus: 'submitted' as const,
      approvalStatus: 'approved' as const,
      operationStatus: 'notStarted' as const,
      objectivesList: [
        'Assess disaster-affected areas and needs',
        'Coordinate with local authorities and partners',
        'Distribute relief supplies and provide recovery support'
      ],
    },
    {
      managedBy: 'partner@siloam.com',
      title: 'Youth Sports Equipment Drive',
      location: 'Singapore',
      about: 'Equipping local youth sports programs with necessary equipment and facilities.',
      objectives: 'Provide sports equipment to 10 community centers serving underprivileged youth.',
      beneficiaries: '800 youth participants aged 10-18',
      initiatorName: 'Youth Sports Foundation',
      organisingTeam: 'Sports Enthusiasts Network',
      targetFund: 20000,
      brickSize: 75,
      deadline: new Date('2026-09-30'),
      type: 'brick' as const,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-09-30'),
      submissionStatus: 'draft' as const,
      approvalStatus: 'pending' as const,
      operationStatus: 'notStarted' as const,
      objectivesList: [
        'Survey community centers for equipment needs',
        'Purchase and distribute sports equipment',
        'Organize sports clinics and training sessions'
      ],
    },
  ];

  const createdProjects: any[] = [];

  for (const projectData of donationProjectsData) {
    try {
      const manager = createdUsers[projectData.managedBy];
      if (!manager) {
        console.log(`⚠️  Manager ${projectData.managedBy} not found, skipping project "${projectData.title}"...`);
        continue;
      }

      const project = await prisma.donationProject.create({
        data: {
          managedBy: manager.id,
          title: projectData.title,
          location: projectData.location,
          about: projectData.about,
          objectives: projectData.objectives,
          beneficiaries: projectData.beneficiaries,
          initiatorName: projectData.initiatorName,
          organisingTeam: projectData.organisingTeam,
          targetFund: projectData.targetFund,
          brickSize: projectData.brickSize,
          deadline: projectData.deadline,
          type: projectData.type,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          submissionStatus: projectData.submissionStatus,
          approvalStatus: projectData.approvalStatus,
          operationStatus: projectData.operationStatus,
          objectivesList: {
            create: projectData.objectivesList.map((objective, index) => ({
              objective,
              order: index + 1,
            })),
          },
        },
      });

      createdProjects.push(project);
      console.log(`✅ Created donation project: "${project.title}" (${project.submissionStatus}/${project.approvalStatus}/${project.operationStatus})`);
    } catch (error) {
      console.error(`❌ Error creating donation project "${projectData.title}":`, error);
    }
  }

  // ==================== DONATION TRANSACTIONS ====================
  console.log('\n💸 Creating donation transactions...\n');

  const donationTransactionsData = [
    // Donations to School Supplies project
    {
      donorEmail: 'alice.johnson@email.com',
      projectIndex: 0, // School Supplies project
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: 500,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      donorEmail: 'bob.wilson@email.com',
      projectIndex: 0,
      type: 'corporate' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Bank Transfer',
      amount: 2000,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      donorEmail: 'carol.davis@email.com',
      projectIndex: 0,
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'PayNow',
      amount: 150,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'pending' as const,
      isThankYouSent: false,
      isAdminNotified: true,
    },
    {
      donorEmail: 'david.brown@email.com',
      projectIndex: 0,
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: 300,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },

    // Donations to Community Garden project
    {
      donorEmail: 'emma.garcia@email.com',
      projectIndex: 1, // Community Garden project
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'PayNow',
      amount: 800,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      donorEmail: 'alice.johnson@email.com',
      projectIndex: 1,
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: 400,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      donorEmail: 'bob.wilson@email.com',
      projectIndex: 1,
      type: 'corporate' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Bank Transfer',
      amount: 1500,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'pending' as const,
      isThankYouSent: false,
      isAdminNotified: true,
    },

    // Donations to Emergency Relief project
    {
      donorEmail: 'carol.davis@email.com',
      projectIndex: 2, // Emergency Relief project
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'PayNow',
      amount: 1000,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      donorEmail: 'david.brown@email.com',
      projectIndex: 2,
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: 750,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'received' as const,
      isThankYouSent: true,
      isAdminNotified: true,
    },
    {
      donorEmail: 'emma.garcia@email.com',
      projectIndex: 2,
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Bank Transfer',
      amount: 1200,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'pending' as const,
      isThankYouSent: false,
      isAdminNotified: true,
    },

    // Pending donation to School Supplies project
    {
      donorEmail: 'alice.johnson@email.com',
      projectIndex: 0,
      type: 'individual' as const,
      countryOfResidence: 'Singapore',
      paymentMode: 'Credit Card',
      amount: 250,
      submissionStatus: 'submitted' as const,
      receiptStatus: 'pending' as const,
      isThankYouSent: false,
      isAdminNotified: false,
    },
  ];

  for (const transactionData of donationTransactionsData) {
    try {
      const donor = createdUsers[transactionData.donorEmail];
      const project = createdProjects[transactionData.projectIndex];

      if (!donor) {
        console.log(`⚠️  Donor ${transactionData.donorEmail} not found, skipping transaction...`);
        continue;
      }

      if (!project) {
        console.log(`⚠️  Project at index ${transactionData.projectIndex} not found, skipping transaction...`);
        continue;
      }

      const transaction = await prisma.donationTransaction.create({
        data: {
          donorId: donor.id,
          projectId: project.id,
          type: transactionData.type,
          countryOfResidence: transactionData.countryOfResidence,
          paymentMode: transactionData.paymentMode,
          amount: transactionData.amount,
          submissionStatus: transactionData.submissionStatus,
          receiptStatus: transactionData.receiptStatus,
          isThankYouSent: transactionData.isThankYouSent,
          isAdminNotified: transactionData.isAdminNotified,
        },
      });

      console.log(`✅ Created donation: $${transaction.amount} from ${donor.email} to "${project.title}" (${transaction.receiptStatus})`);
    } catch (error) {
      console.error('❌ Error creating donation transaction:', error);
    }
  }

  // ==================== SUMMARY ====================
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('📋 TEST CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('ROLE                 | EMAIL                              | PASSWORD');
  console.log('─────────────────────┼────────────────────────────────────┼─────────────');
  [...usersData, ...donorUsersData].forEach((user) => {
    console.log(
      `${user.role.padEnd(20)} | ${user.email.padEnd(34)} | ${user.password}`
    );
  });
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('\n📝 Notes:');
  console.log('   • Super Admin has full system access');
  console.log('   • General Manager can manage projects and operations');
  console.log('   • Finance Manager handles financial operations and can view all donation projects');
  console.log('   • Partners have complete onboarding profiles with skills, languages, interests');
  console.log('   • Donor users (Alice, Bob, Carol, David, Emma) are regular partners who can donate');
  console.log('   • 4 donation projects created with various statuses (approved, draft, pending)');
  console.log('   • 11 donation transactions created with mix of received/pending receipt statuses');
  console.log('   • All passwords are: password');
  console.log('   • Use these credentials to test different permission levels and donation features\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
