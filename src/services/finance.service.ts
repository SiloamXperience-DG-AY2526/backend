import * as financeModel from '../models/finance.model';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../utils/errors';
import { UpdateDonationReceiptStatusInput } from '../schemas/index';

//TODO: test if it returns totalDonations = 0 for projects without donations

export const getDonProjects = async () => {
  // TODO: build the where clause here based on authorisation and other params
  // TODO: if status = draft, then set totaldonations to null (not applicable)
  const { projectSummaries, totalDonationsByProject } =
    await financeModel.getDonProjects();

  // for O(1) lookup later
  const donationMap = new Map(
    totalDonationsByProject.map((d) => [d.projectId, d._sum.amount])
  );
  const summaries = projectSummaries.map((summary) => ({
    ...summary,
    totalRaised: donationMap.get(summary.id) ?? new Prisma.Decimal(0),
  }));

  return summaries;
};

export const getDonProjectDetails = async (projectId: string) => {
  // TODO: build the where clause here based on authorisation and other params
  // TODO: if status = draft, then set totaldonations to null (not applicable)

  try {
    const { projectDetails, totalDonations } =
      await financeModel.getDonProjectDetails(projectId);
    const fullDetails = {
      ...projectDetails,
      totalRaised: totalDonations._sum.amount ?? new Prisma.Decimal(0),
      // note: if project dne, totalDonations._sum.amount = null
    };
    return fullDetails;
  } catch (err) {
    // to translate and propagate error
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code == 'P2025'
    ) {
      throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
    }
    throw err;
  }
};

export const getProjectDonationTransactions = async (projectId: string) => {
  return await financeModel.getProjectDonationTransactions(projectId);
};

export const updateDonationReceiptStatus = async (
  data: UpdateDonationReceiptStatusInput
) => {
  await financeModel.updateDonationReceiptStatus(data);
};

export const getProposedProjects = async () => {
  return await financeModel.getProposedProjects();
};
