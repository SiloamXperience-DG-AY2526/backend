import { Request, Response } from 'express';
import * as financeService from '../services/finance.service';
import { NotFoundError } from '../utils/errors';

export const getDonProjects = async (req: Request, res: Response) => {
  const projSummaries = await financeService.getDonProjects();

  res.json(projSummaries);
};

export const getDonProjectDetails = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const details = await financeService.getDonProjectDetails(projectId);

  if (!details) {
    throw new NotFoundError(`Donation Project ${projectId} Not Found!`);
  }

  res.json(details);
};

export const getProjectDonationTransactions = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const donations = await financeService.getProjectDonationTransactions(
    projectId
  );

  res.json(donations);
};

export const updateDonationReceiptStatus = async (
  req: Request,
  res: Response
) => {
  const { donationId } = req.params;
  const { receiptStatus } = req.body;

  await financeService.updateDonationReceiptStatus({
    donationId,
    receiptStatus,
  });

  res.status(204).send();
};

export const getProposedProjects = async (req: Request, res: Response) => {
  const proposedProjects = await financeService.getProposedProjects();

  res.json(proposedProjects);
};

export const updateProposedProjectStatus = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.params;
  const { status } = req.body;

  await financeService.updateProposedProjectStatus({
    projectId,
    status,
  });

  res.status(204).send();
};
