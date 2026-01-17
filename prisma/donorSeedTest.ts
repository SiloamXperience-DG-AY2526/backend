import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting donor seed...');

  // Create test partner users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const partner1 = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      partner: {
        create: {
          countryCode: '+65',
          contactNumber: '91234567',
          gender: 'male',
          nationality: 'Singapore',
          volunteerAvailability: 'weekends',
          consentUpdatesCommunications: true,
          residentialAddress: '123 Main Street',
          emergencyCountryCode: '+65',
          emergencyContactNumber: '81234567',
          identificationNumber: 'S1234567A',
          occupation: 'Software Engineer',
        },
      },
    },
  });

  console.log('✅ Created partner 1:', partner1.email);

  const partner2 = await prisma.user.upsert({
    where: { email: 'partner2@example.com' },
    update: {},
    create: {
      email: 'partner2@example.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      partner: {
        create: {
          countryCode: '+65',
          contactNumber: '98765432',
          gender: 'female',
          nationality: 'Singapore',
          volunteerAvailability: 'weekdays',
          consentUpdatesCommunications: true,
          emergencyCountryCode: '+65',
          emergencyContactNumber: '87654321',
          identificationNumber: 'S7654321B',
          occupation: 'Teacher',
        },
      },
    },
  });

  console.log('✅ Created partner 2:', partner2.email);

  // Create super admin for finance manager operations
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@siloamxperience.org' },
    update: {},
    create: {
      email: 'admin@siloamxperience.org',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'superAdmin',
    },
  });

  console.log('✅ Created super admin:', superAdmin.email);

  // Create approved donation projects (brick type)
  const project1 = await prisma.donationProject.create({
    data: {
      title: 'Build a School in Cambodia',
      location: 'Siem Reap, Cambodia',
      about: 'Help us build a primary school for 200 underprivileged children in rural Cambodia',
      objectives: 'Provide quality education infrastructure and resources',
      targetFund: 50000,
      deadline: new Date('2026-12-31'),
      beneficiaries: '200 children aged 6-12',
      type: 'brick',
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      brickSize: 250,
      startDate: new Date(),
      endDate: new Date('2026-12-31'),
      managedBy: superAdmin.id,
    },
  });

  console.log('✅ Created project 1:', project1.title);

  const project2 = await prisma.donationProject.create({
    data: {
      title: 'Clean Water Initiative',
      location: 'Northern Thailand',
      about: 'Install water filtration systems in 5 villages',
      objectives: 'Provide clean drinking water to 1000+ villagers',
      targetFund: 30000,
      deadline: new Date('2026-09-30'),
      beneficiaries: '1000+ villagers across 5 villages',
      type: 'sponsor',
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      startDate: new Date(),
      endDate: new Date('2026-09-30'),
      managedBy: superAdmin.id,
    },
  });

  console.log('✅ Created project 2:', project2.title);

  // Create ongoing project (no target fund or deadline)
  const project3 = await prisma.donationProject.create({
    data: {
      title: 'General Operating Fund',
      location: 'Global',
      about: 'Support our ongoing humanitarian operations and emergency relief efforts',
      objectives: 'Sustain daily operations and respond to urgent needs',
      beneficiaries: 'All beneficiaries across our programs',
      type: 'sponsor',
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      startDate: new Date(),
      endDate: new Date('2027-12-31'),
      managedBy: superAdmin.id,
    },
  });

  console.log('✅ Created project 3:', project3.title);

  // Create partner-proposed project (pending approval)
  const partner1Data = await prisma.partner.findUnique({
    where: { userId: partner1.id },
  });

  if (partner1Data) {
    const project4 = await prisma.donationProject.create({
      data: {
        title: 'Community Library Project',
        location: 'Indonesia',
        about: 'Establish a community library with 5000+ books',
        objectives: 'Promote literacy and education in rural communities',
        targetFund: 15000,
        deadline: new Date('2026-08-31'),
        beneficiaries: '500 community members',
        type: 'partnerLed',
        submissionStatus: 'draft',
        approvalStatus: 'pending',
        startDate: new Date(),
        endDate: new Date('2026-08-31'),
        managedBy: partner1.id,
      },
    });

    console.log('✅ Created partner-proposed project:', project4.title);
  }

  // Create sample donation transactions
  const partner1PartnerData = await prisma.partner.findUnique({
    where: { userId: partner1.id },
  });

  if (partner1PartnerData) {
    const donation1 = await prisma.donationTransaction.create({
      data: {
        projectId: project1.id,
        donorId: partner1.id,
        type: 'individual',
        amount: 500,
        countryOfResidence: 'Singapore',
        paymentMode: 'bank_transfer',
        receiptStatus: 'received',
        submissionStatus: 'submitted',
      },
    });

    console.log('✅ Created donation 1: $' + donation1.amount);

    const donation2 = await prisma.donationTransaction.create({
      data: {
        projectId: project2.id,
        donorId: partner1.id,
        type: 'individual',
        amount: 1000,
        countryOfResidence: 'Singapore',
        paymentMode: 'credit_card',
        receiptStatus: 'pending',
        submissionStatus: 'submitted',
      },
    });

    console.log('✅ Created donation 2: $' + donation2.amount);
  }

  const partner2PartnerData = await prisma.partner.findUnique({
    where: { userId: partner2.id },
  });

  if (partner2PartnerData) {
    const donation3 = await prisma.donationTransaction.create({
      data: {
        projectId: project3.id,
        donorId: partner2.id,
        type: 'corporate',
        amount: 5000,
        countryOfResidence: 'Singapore',
        paymentMode: 'bank_transfer',
        receiptStatus: 'received',
        submissionStatus: 'submitted',
      },
    });

    console.log('✅ Created donation 3: $' + donation3.amount);
  }

  console.log('\n🎉 Donor seed completed!');
  console.log('\n📋 Test Credentials:');
  console.log('   Partner 1: partner@example.com / password123');
  console.log('   Partner 2: partner2@example.com / password123');
  console.log('   Admin: admin@siloamxperience.org / password123');
  console.log('\n📊 Sample Data Created:');
  console.log('   - 3 Users (2 partners, 1 admin)');
  console.log('   - 4 Donation Projects (3 approved, 1 pending)');
  console.log('   - 3 Donation Transactions');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
