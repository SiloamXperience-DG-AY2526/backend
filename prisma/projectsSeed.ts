import { PrismaClient, ProjectFrequency, ProjectOperationStatus, SubmissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

const MANAGED_BY_ID = '62920d6b-0901-4692-83a0-ad4872eb8270'; // <-- replace if needed

function atDateWithTime(date: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  // keep seed deterministic-ish
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 15); // Jan 15 this year

  const imageUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmnS3u0GRabLJ8h-W7ywyAP57MSN9DdA0AYQ&s';

  // 6 projects: 5 this year, 1 last year
  const projects = [
    {
      title: 'Community Health Screening (Siloam Clinic)',
      location: 'Tampines, Singapore',
      aboutDesc:
        'Support community health screening: registration, guiding seniors, and logistics support.',
      objectives:
        'Ensure smooth registration, reduce waiting time, and assist clinical team with non-medical tasks.',
      beneficiaries: 'Seniors & low-income families in the community',
      startDate: addDays(yearStart, 10),
      endDate: addDays(yearStart, 10),
      startTime: '09:00',
      endTime: '13:00',
      frequency: ProjectFrequency.once,
      operationStatus: ProjectOperationStatus.ongoing,
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      sessions: [
        { name: 'Morning Session', dateOffsetDays: 10, start: '09:00', end: '13:00' },
      ],
      positions: [
        {
          role: 'Registration Support',
          description: 'Help register participants, verify details, and guide them to stations.',
          totalSlots: 6,
          skills: ['Communication', 'Customer Service', 'Attention to Detail'],
        },
        {
          role: 'Logistics & Queue Management',
          description: 'Manage queues, distribute forms, and coordinate flow between stations.',
          totalSlots: 4,
          skills: ['Coordination', 'Problem Solving', 'Teamwork'],
        },
      ],
    },

    {
      title: 'Hospital Visitor Support',
      location: 'Woodlands, Singapore',
      aboutDesc: 'Help visitors find wards, manage directions, and provide basic support.',
      objectives: 'Improve patient/visitor experience through guidance and hospitality.',
      beneficiaries: 'Patients & Visitors',
      startDate: addDays(yearStart, 60),
      endDate: addDays(yearStart, 60),
      startTime: '10:00',
      endTime: '14:00',
      frequency: ProjectFrequency.once,
      operationStatus: ProjectOperationStatus.paused,
      submissionStatus: 'submitted',
      approvalStatus: 'pending',
      sessions: [
        { name: 'Late Morning Session', dateOffsetDays: 60, start: '10:00', end: '14:00' },
      ],
      positions: [
        {
          role: 'Front Desk Support',
          description: 'Assist visitors with directions and basic enquiries.',
          totalSlots: 5,
          skills: ['Communication', 'Empathy', 'Customer Service'],
        },
      ],
    },

    {
      title: 'Food Distribution Drive',
      location: 'Hougang, Singapore',
      aboutDesc: 'Pack and distribute food items to families in need.',
      objectives: 'Support food security through efficient packing and distribution.',
      beneficiaries: 'Low-income families',
      startDate: addDays(yearStart, 120),
      endDate: addDays(yearStart, 120),
      startTime: '08:30',
      endTime: '12:30',
      frequency: ProjectFrequency.once,
      operationStatus: ProjectOperationStatus.ongoing,
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      sessions: [
        { name: 'Packing & Distribution', dateOffsetDays: 120, start: '08:30', end: '12:30' },
      ],
      positions: [
        {
          role: 'Packing Crew',
          description: 'Pack food items accurately and efficiently.',
          totalSlots: 10,
          skills: ['Teamwork', 'Attention to Detail'],
        },
        {
          role: 'Distribution Support',
          description: 'Help distribute items and manage queue flow.',
          totalSlots: 6,
          skills: ['Coordination', 'Communication'],
        },
      ],
    },

    {
      title: 'Youth Mentorship Workshop',
      location: 'Jurong East, Singapore',
      aboutDesc: 'Support workshop logistics and mentor secondary school students.',
      objectives: 'Mentor youth in study habits and growth mindset.',
      beneficiaries: 'Youth / Students',
      startDate: addDays(yearStart, 200),
      endDate: addDays(yearStart, 200),
      startTime: '13:00',
      endTime: '17:00',
      frequency: ProjectFrequency.once,
      operationStatus: ProjectOperationStatus.completed,
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      sessions: [
        { name: 'Afternoon Workshop', dateOffsetDays: 200, start: '13:00', end: '17:00' },
      ],
      positions: [
        {
          role: 'Mentor',
          description: 'Guide students through activities and discussions.',
          totalSlots: 8,
          skills: ['Coaching', 'Communication', 'Empathy'],
        },
      ],
    },

    {
      title: 'Clinic Admin Digitisation Support',
      location: 'Bedok, Singapore',
      aboutDesc: 'Help digitise forms, scan documents, and support admin workflow.',
      objectives: 'Reduce manual admin load and improve record organisation.',
      beneficiaries: 'Clinic admin team & patients',
      startDate: addDays(yearStart, 280),
      endDate: addDays(yearStart, 280),
      startTime: '09:30',
      endTime: '12:30',
      frequency: ProjectFrequency.once,
      operationStatus: ProjectOperationStatus.cancelled,
      submissionStatus: 'withdrawn',
      approvalStatus: 'rejected',
      sessions: [
        { name: 'Morning Admin Support', dateOffsetDays: 280, start: '09:30', end: '12:30' },
      ],
      positions: [
        {
          role: 'Admin Support',
          description: 'Scan, file, and organise documents carefully.',
          totalSlots: 4,
          skills: ['Attention to Detail', 'Organisation'],
        },
      ],
    },

    // last year project
    {
      title: 'Last Year Community Care Visit',
      location: 'Ang Mo Kio, Singapore',
      aboutDesc: 'Support community care visits (logistics and companionship).',
      objectives: 'Provide companionship and basic assistance.',
      beneficiaries: 'Seniors',
      startDate: new Date(now.getFullYear() - 1, 10, 20), // Nov 20 last year
      endDate: new Date(now.getFullYear() - 1, 10, 20),
      startTime: '10:00',
      endTime: '12:00',
      frequency: ProjectFrequency.once,
      operationStatus: ProjectOperationStatus.completed,
      submissionStatus: 'submitted',
      approvalStatus: 'approved',
      sessions: [
        { name: 'Care Visit', dateOffsetDays: 0, start: '10:00', end: '12:00' },
      ],
      positions: [
        {
          role: 'Care Support Volunteer',
          description: 'Assist with visit coordination and companionship.',
          totalSlots: 5,
          skills: ['Empathy', 'Communication'],
        },
      ],
    },
  ];

  // create them
  for (const p of projects) {
    const startDate = p.startDate;
    const endDate = p.endDate;

    const created = await prisma.volunteerProject.create({
      data: {
        managedById: MANAGED_BY_ID,
        approvedById: MANAGED_BY_ID, // ok if same for seed
        title: p.title,
        location: p.location,
        aboutDesc: p.aboutDesc,
        objectives: p.objectives,
        beneficiaries: p.beneficiaries,
        initiatorName: 'Siloam Outreach',
        organisingTeam: 'Volunteer Ops Team',
        proposedPlan: 'Seeded project plan',
        startDate,
        endDate,
        startTime: atDateWithTime(startDate, p.startTime),
        endTime: atDateWithTime(startDate, p.endTime),
        frequency: p.frequency,
        interval: null,
        dayOfWeek: null,
        submissionStatus: SubmissionStatus.draft,
        approvalStatus: p.approvalStatus as any, // depends on your ProjectApprovalStatus enum
        operationStatus: p.operationStatus,
        approvalNotes: null,
        approvalMessage: 'Seeded project',
        image: imageUrl,
        attachments: null,

        sessions: {
          create: p.sessions.map((s) => {
            // last-year project uses actual startDate; others use yearStart offsets
            const baseDate =
              p.title.startsWith('Last Year') ? startDate : addDays(yearStart, s.dateOffsetDays);

            return {
              name: s.name,
              sessionDate: baseDate,
              startTime: atDateWithTime(baseDate, s.start),
              endTime: atDateWithTime(baseDate, s.end),
            };
          }),
        },

        positions: {
          create: p.positions.map((pos) => ({
            role: pos.role,
            description: pos.description,
            totalSlots: pos.totalSlots,
            skills: {
              create: pos.skills.map((skill, idx) => ({
                skill,
                order: idx + 1,
              })),
            },
          })),
        },
      },
      select: { id: true, title: true, operationStatus: true },
    });

    console.log('Created project:', created);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
