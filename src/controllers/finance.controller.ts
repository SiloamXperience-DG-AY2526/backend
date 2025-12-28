import { Request, Response } from 'express';
import * as financeService from '../services/finance.service';
import { NotFoundError } from '../utils/errors';
import { AppError } from '../middlewares/errorHandler';

export const getFinancialOverview = async (req: Request, res: Response) => {
  const financial_overview = await financeService.getFinancialOverview();

  if (!financial_overview) {
    throw new AppError('Server failed to fetch financial overview', 500);
  }

  res.json(financial_overview);
};

export const getProjectBudgets = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const budgets = await financeService.getBudgetSummaries(projectId);

  if (!budgets) {
    throw new NotFoundError(`Budget Data not found for project ${projectId}`);
  }

  res.json(budgets);
};

export const getProjectTransactions = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const transactions = await financeService.getAllTransactions(projectId);

  if (!transactions) {
    throw new NotFoundError(
      `Transaction Data not found for project ${projectId}`
    );
  }

  res.json(transactions);
};

export const createCommitment = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const commitment = await financeService.createCommitment({
    projectId,
    ...req.body,
  });
  //no need to check if commitment exists, since it should throw if creation fails

  res.status(201).json({
    status: 'success',
    data: commitment,
    message: 'Commitment created successfully',
  });
};

export const updateCommitmentStatus = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;
  const { status } = req.body;

  await financeService.updateCommitmentStatus({
    projectId,
    commitmentId: id,
    status,
  });

  res.status(204).send();
};

export const deleteCommitment = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;

  await financeService.deleteCommitment({
    projectId,
    commitmentId: id,
  });

  res.status(204).send();
};

export const createDisbursement = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const disbursement = await financeService.createDisbursement({
    projectId,
    ...req.body,
  });

  res.status(201).json({
    status: 'success',
    data: disbursement,
    message: 'Disbursement created successfully',
  });
};

export const updateDisbursementStatus = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;
  const { status } = req.body;
  await financeService.updateDisbursementStatus({
    projectId,
    disbursementId: id,
    status,
  });

  res.status(204).send();
};

export const deleteDisbursement = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;

  await financeService.deleteDisbursement({
    projectId,
    disbursementId: id,
  });

  res.status(204).send();
};
