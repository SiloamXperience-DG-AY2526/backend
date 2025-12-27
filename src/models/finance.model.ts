import { prisma } from '../lib/prisma';
import { UpdateDonationReceiptStatusInput } from '../schemas/index';

const receivedDonationFilter = {
  submissionStatus: 'submitted',
  verificationStatus: 'received',
} as const;

const pmPublicInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;

export const getDonProjects = async () => {
  // faster parallel execution
  // TODO: return values based on authorisation
  const [projectSummaries, totalDonationsByProject] = await Promise.all([
    prisma.donationProject.findMany({
      orderBy: { title: 'desc' },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        targetFund: true,
        submissionStatus: true,
        approvalStatus: true,
        project_manager: pmPublicInfo,
      },
    }),
    prisma.donationTransaction.groupBy({
      by: ['projectId'],
      where: {
        ...receivedDonationFilter,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);
  return { projectSummaries, totalDonationsByProject };
};

export const getDonProjectDetails = async (projectId: string) => {
  // faster parallel execution
  const [projectDetails, totalDonations] = await Promise.all([
    await prisma.donationProject.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        project_manager: pmPublicInfo,
      },
    }),
    await prisma.donationTransaction.aggregate({
      where: {
        projectId,
        ...receivedDonationFilter,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);
  return { projectDetails, totalDonations };
};

export const getProjectDonationTransactions = async (projectId: string) => {
  const donations = await prisma.donationTransaction.findMany({
    where: {
      id: projectId,
    },
  });
  return donations;
};

export const updateDonationReceiptStatus = async (
  data: UpdateDonationReceiptStatusInput
) => {
  const donations = await prisma.donationTransaction.update({
    where: {
      id: data.donationId,
    },
    data: {
      receiptStatus: data.receiptStatus,
    },
  });
  return donations;
};
