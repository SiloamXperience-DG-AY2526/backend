import * as financeModel from '../models/financeModel';
import * as schema from '../schemas';

const getAggregateOverview = async (projectId?: string) => {
  const { committedByYear, disbursedByYear } =
    await financeModel.getAggregatesByYear(projectId);

  const committedDict = Object.fromEntries(
    committedByYear.map((c) => [
      c.fiscalYear,
      c._sum?.amount ?? 0, // safely handle undefined _sum and amount
    ])
  );
  const disbursedDict = Object.fromEntries(
    disbursedByYear.map((d) => [
      d.fiscalYear,
      d._sum?.amount ?? 0, // safely handle undefined _sum and amount
    ])
  );

  const allYears = Array.from(
    new Set([
      ...committedByYear.map((c) => c.fiscalYear),
      ...disbursedByYear.map((d) => d.fiscalYear),
    ])
  ).sort((a, b) => a - b);

  const combined = allYears.map((year) => ({
    fiscalYear: year,
    committed: committedDict[year] ?? 0,
    disbursed: disbursedDict[year] ?? 0,
  }));
  return combined;
};

export const getFinancialOverview = async () => {
  return await getAggregateOverview();
};

export const getBudgetSummaries = async (projectId: string) => {
  return await getAggregateOverview(projectId);
};

export const getAllTransactions = async (projectId: string) => {
  return await financeModel.getTransactions(projectId);
};

export const createCommitment = async (commitment: schema.CreateCommitment) => {
  return await financeModel.createCommitment(commitment);
};

export const updateCommitmentStatus = async (
  data: schema.UpdateCommitmentStatus
) => {
  await financeModel.updateCommitmentStatus(data);
};

export const deleteCommitment = async (data: schema.DeleteCommitment) => {
  await financeModel.deleteCommitment(data);
};

export const createDisbursement = async (
  disbursement: schema.CreateCommitment
) => {
  return await financeModel.createDisbursement(disbursement);
};

export const updateDisbursementStatus = async (
  data: schema.UpdateDisbursementStatus
) => {
  await financeModel.updateDisbursementStatus(data);
};

export const deleteDisbursement = async (data: schema.DeleteDisbursement) => {
  await financeModel.deleteDisbursement(data);
};
