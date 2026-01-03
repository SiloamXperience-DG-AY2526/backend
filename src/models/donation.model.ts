import { prisma } from '../lib/prisma';
import { SubmitDonationApplicationInput } from '../schemas/index';
import { Prisma } from '@prisma/client';

// Common select for project manager public info
const pmPublicInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;

/**
 * Get all published donation projects for partners to view
 * Filters by approval status and allows filtering by type (ongoing/specific)
 */
export const getAllDonationProjects = async (filters: {
  type?: 'ongoing' | 'specific' | 'all';
  page: number;
  limit: number;
}) => {
  const { type = 'all', page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    approvalStatus: 'approved',
    submissionStatus: 'submitted',
  };

  // Filter by type: ongoing (no target/deadline) vs specific (has target/deadline)
  if (type === 'ongoing') {
    where.targetFund = null;
    where.deadline = null;
  } else if (type === 'specific') {
    where.AND = [
      { targetFund: { not: null } },
      // Note: deadline is optional even for specific projects per requirements
    ];
  }

  const [projects, totalCount] = await Promise.all([
    prisma.donationProject.findMany({
      where,
      select: {
        id: true,
        title: true,
        location: true,
        about: true,
        objectives: true,
        beneficiaries: true,
        targetFund: true,
        brickSize: true,
        deadline: true,
        type: true,
        startDate: true,
        endDate: true,
        image: true,
        attachments: true,
        initiatorName: true,
        organisingTeam: true,
        project_manager: pmPublicInfo,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.donationProject.count({ where }),
  ]);

  // Get total raised for each project
  const projectIds = projects.map((p) => p.id);
  const donationSums = await prisma.donationTransaction.groupBy({
    by: ['projectId'],
    where: {
      projectId: { in: projectIds },
      submissionStatus: 'submitted',
      receiptStatus: 'received',
    },
    _sum: {
      amount: true,
    },
  });

  // Map donations to projects
  const donationMap = new Map(
    donationSums.map((d) => [d.projectId, d._sum.amount])
  );

  const projectsWithTotals = projects.map((project) => ({
    ...project,
    totalRaised: donationMap.get(project.id) ?? new Prisma.Decimal(0),
    // Determine if project is ongoing or specific
    isOngoing: project.targetFund === null && project.deadline === null,
  }));

  return {
    projects: projectsWithTotals,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Get a partner's donation history (transactions)
 * Filter by status: pending (submitted but not received), completed (received), cancelled
 */
export const getPartnerDonationHistory = async (
  partnerId: string,
  filters: {
    status?: 'pending' | 'completed' | 'cancelled' | 'all';
    page: number;
    limit: number;
  }
) => {
  const { status = 'all', page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  // Build where clause based on status
  const where: any = {
    donorId: partnerId,
  };

  if (status === 'pending') {
    where.receiptStatus = 'pending';
  } else if (status === 'completed') {
    where.receiptStatus = 'received';
  } else if (status === 'cancelled') {
    where.receiptStatus = 'cancelled';
  }

  const [donations, totalCount] = await Promise.all([
    prisma.donationTransaction.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            location: true,
            image: true,
            type: true,
            brickSize: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.donationTransaction.count({ where }),
  ]);

  return {
    donations,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Get a single donation transaction detail
 */
export const getDonationDetail = async (donationId: string, partnerId: string) => {
  const donation = await prisma.donationTransaction.findFirst({
    where: {
      id: donationId,
      donorId: partnerId,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          location: true,
          image: true,
          type: true,
          brickSize: true,
          project_manager: pmPublicInfo,
        },
      },
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return donation;
};

/**
 * Submit a donation application (create transaction)
 * Status starts as 'submitted' with receipt status as 'pending'
 */
export const submitDonationApplication = async (
  partnerId: string,
  data: SubmitDonationApplicationInput
) => {
  // If brickCount is provided, calculate amount based on project's brickSize
  let finalAmount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;

  if (data.brickCount) {
    const project = await prisma.donationProject.findUnique({
      where: { id: data.projectId },
      select: { brickSize: true },
    });

    if (project?.brickSize) {
      finalAmount = data.brickCount * project.brickSize.toNumber();
    }
  }

  const donation = await prisma.donationTransaction.create({
    data: {
      donorId: partnerId,
      projectId: data.projectId,
      type: data.type,
      countryOfResidence: data.countryOfResidence,
      paymentMode: data.paymentMode,
      amount: new Prisma.Decimal(finalAmount),
      submissionStatus: 'submitted',
      receiptStatus: 'pending',
      isThankYouSent: false,
      isAdminNotified: false,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          type: true,
          brickSize: true,
        },
      },
    },
  });

  return donation;
};

/**
 * Get donation homepage data for partners
 * Returns summary statistics and featured/recent projects
 */
export const getDonationHomepageData = async () => {
  // Get total raised across all projects
  const totalRaisedAggregate = await prisma.donationTransaction.aggregate({
    where: {
      submissionStatus: 'submitted',
      receiptStatus: 'received',
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  // Get number of active projects
  const activeProjectsCount = await prisma.donationProject.count({
    where: {
      approvalStatus: 'approved',
      submissionStatus: 'submitted',
    },
  });

  // Get featured/recent projects (top 3 most recent approved)
  const featuredProjects = await prisma.donationProject.findMany({
    where: {
      approvalStatus: 'approved',
      submissionStatus: 'submitted',
    },
    select: {
      id: true,
      title: true,
      location: true,
      about: true,
      targetFund: true,
      deadline: true,
      image: true,
      type: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  });

  // Get total raised for each featured project
  const featuredProjectIds = featuredProjects.map((p) => p.id);
  const featuredDonationSums = await prisma.donationTransaction.groupBy({
    by: ['projectId'],
    where: {
      projectId: { in: featuredProjectIds },
      submissionStatus: 'submitted',
      receiptStatus: 'received',
    },
    _sum: {
      amount: true,
    },
  });

  const donationMap = new Map(
    featuredDonationSums.map((d) => [d.projectId, d._sum.amount])
  );

  const featuredProjectsWithTotals = featuredProjects.map((project) => ({
    ...project,
    totalRaised: donationMap.get(project.id) ?? new Prisma.Decimal(0),
    isOngoing: project.targetFund === null && project.deadline === null,
  }));

  return {
    statistics: {
      totalRaised: totalRaisedAggregate._sum.amount ?? new Prisma.Decimal(0),
      totalDonations: totalRaisedAggregate._count,
      activeProjects: activeProjectsCount,
    },
    featuredProjects: featuredProjectsWithTotals,
  };
};
