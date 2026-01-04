import { prisma } from '../src/prisma/client';



async function main() {
  console.log('🌱 Seeding database...');

  /* ---------------- USERS ---------------- */



  const user1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash:'test123',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      passwordHash:'test123',
    },
  });

  console.log('✅ Users created');

  /* ---------------- PROJECTS ---------------- */

  const project1 = await prisma.volunteerProject.create({
    data: {
      managedById: user1.id,
      title: 'Community Outreach Program',
      location: 'Singapore',
      aboutDesc: 'Helping local communities',
      objectives: 'Support and outreach',
      beneficiaries: 'Low income families',
      startTime: new Date(),
      endTime: new Date(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      frequency: 'once',
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      operationStatus: 'ongoing',
    },
  });

  const project2 = await prisma.volunteerProject.create({
    data: {
      managedById: user2.id,
      title: 'Food Distribution Drive',
      location: 'Johor',
      aboutDesc: 'Food aid for the needy',
      objectives: 'Distribute food packs',
      beneficiaries: 'Rural families',
      startTime: new Date(),
      endTime: new Date(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      frequency: 'weekly',
      interval: 1,
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      operationStatus: 'ongoing',
    },
  });

  console.log('✅ Projects created');

  /* ---------------- POSITIONS ---------------- */

  const position1 = await prisma.projectPosition.create({
    data: {
      projectId: project1.id,
      role: 'Volunteer Coordinator',
      description: 'Coordinate volunteers',
      totalSlots: 3,
    },
  });

  const position2 = await prisma.projectPosition.create({
    data: {
      projectId: project1.id,
      role: 'Logistics Assistant',
      description: 'Handle logistics',
      totalSlots: 5,
    },
  });

  const position3 = await prisma.projectPosition.create({
    data: {
      projectId: project2.id,
      role: 'Food Packing Volunteer',
      description: 'Pack food items',
      totalSlots: 10,
    },
  });

  console.log('✅ Positions created');

  /* ---------------- SESSIONS ---------------- */

  const session1 = await prisma.session.create({
    data: {
      projectId: project1.id,
      name: 'Orientation Session',
      sessionDate: new Date(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  const session2 = await prisma.session.create({
    data: {
      projectId: project1.id,
      name: 'Distribution Day',
      sessionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    },
  });

  const session3 = await prisma.session.create({
    data: {
      projectId: project2.id,
      name: 'Food Packing Day',
      sessionDate: new Date(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Sessions created');

  /* ---------------- APPLICATIONS ---------------- */

  const application1 = await prisma.volunteerProjectPosition.create({
    data: {
      volunteerId: user1.id,
      positionId: position1.id,
      status: 'reviewing',
      hasConsented: true,
    },
  });

  const application2 = await prisma.volunteerProjectPosition.create({
    data: {
      volunteerId: user2.id,
      positionId: position2.id,
      status: 'approved',
      hasConsented: true,
      approvedAt: new Date(),
      approvedBy: user1.id,
    },
  });

  console.log('✅ Volunteer applications created');

  /* ---------------- VOLUNTEER SESSIONS ---------------- */

  await prisma.volunteerSession.create({
    data: {
      volunteerId: user1.id,
      sessionId: session1.id,
    },
  });

  await prisma.volunteerSession.create({
    data: {
      volunteerId: user2.id,
      sessionId: session2.id,
      approvedAt: new Date(),
      approvedBy: user1.id,
    },
  });

  console.log('✅ Volunteer sessions linked');

  console.log('🌱 Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
