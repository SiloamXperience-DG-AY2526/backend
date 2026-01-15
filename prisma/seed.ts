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

  const partnerEmails = ['partner@siloam.com'];
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

  // ==================== SUMMARY ====================
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('📋 TEST CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('ROLE                 | EMAIL                              | PASSWORD');
  console.log('─────────────────────┼────────────────────────────────────┼─────────────');
  usersData.forEach((user) => {
    console.log(
      `${user.role.padEnd(20)} | ${user.email.padEnd(34)} | ${user.password}`
    );
  });
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('\n📝 Notes:');
  console.log('   • Super Admin has full system access');
  console.log('   • General Manager can manage projects and operations');
  console.log('   • Finance Manager handles financial operations');
  console.log('   • Partners have complete onboarding profiles with skills, languages, interests');
  console.log('   • All passwords are: password');
  console.log('   • Use these credentials to test different permission levels\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
