import { prisma } from '../lib/prisma';
import { PMPublicSelect } from '../projections/user.projections';
import { SubmitDonationApplicationInput } from '../schemas/index';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';

/**
 * Get a user's donation history (transactions)
 * Filter by status: pending (submitted but not received), completed (received), cancelled
 */
export const getMyDonationHistory = async (
  where: Prisma.DonationTransactionWhereInput,
  pagination: Pagination
) => {

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
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.donationTransaction.count({ where }),
  ]);

  return {
    donations,
    totalCount
  };
};

/**
 * Get a single donation transaction detail
 */
export const getDonationDetail = async (
  donationId: string,
  partnerId: string
) => {
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
          project_manager: {
            select: PMPublicSelect,
          },
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
  let finalAmount =
    typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;

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
