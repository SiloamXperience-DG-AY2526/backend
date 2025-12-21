import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  CreateCommitment,
  CreateDisbursement,
  DeleteCommitment,
  DeleteDisbursement,
  UpdateCommitmentStatus,
  UpdateDisbursementStatus,
} from '../schemas';

interface FinanceAggregateByYear {
  fiscalYear: number;
  amount: number;
}

interface FinanceAggregatesResult {
  committedByYear: FinanceAggregateByYear[];
  disbursedByYear: FinanceAggregateByYear[];
}

type CommittedByYear = {
  fiscalYear: number;
  _sum?: { amount?: Prisma.Decimal | null };
};

type DisbursedByYear = {
  fiscalYear: number;
  _sum?: { amount?: Prisma.Decimal | null };
};

/**
 *
 * @returns an object with two arrays, committedByYear and disbursedByYear.
 *
 * Notes:
 * Fiscal years with no records are not included.
 * Arrays are ordered by fiscal year.
 */
export const getAggregatesByYear = async (
  projectId?: string
): Promise<FinanceAggregatesResult> => {
  const [committedRaw, disbursedRaw] = await prisma.$transaction([
    prisma.committedFund.groupBy({
      by: ['fiscalYear'],
      where: projectId ? { projectId } : {},
      _sum: {
        amount: true,
      },
      orderBy: { fiscalYear: 'asc' },
    }),
    prisma.disbursement.groupBy({
      by: ['fiscalYear'],
      where: projectId ? { projectId } : {},
      _sum: {
        amount: true,
      },
      orderBy: { fiscalYear: 'asc' },
    }),
  ]);
  const committedByYear = committedRaw.map((c: CommittedByYear) => ({
    fiscalYear: c.fiscalYear,
    amount: c._sum?.amount?.toNumber() ?? 0,
  }));
  const disbursedByYear = disbursedRaw.map((d: DisbursedByYear) => ({
    fiscalYear: d.fiscalYear,
    amount: d._sum?.amount?.toNumber() ?? 0,
  }));
  return { committedByYear, disbursedByYear };
};

export const getTransactions = async (projectId: string) => {
  const [commitments, disbursements] = await prisma.$transaction([
    prisma.committedFund.findMany({
      where: { projectId },
      orderBy: { fiscalYear: 'asc' },
    }),
    prisma.disbursement.findMany({
      where: { projectId },
      orderBy: { fiscalYear: 'asc' },
    }),
  ]);
  return { commitments, disbursements };
};

export const createCommitment = async (commitment: CreateCommitment) => {
  const created = await prisma.committedFund.create({
    data: commitment,
  });
  return created;
};

export const updateCommitmentStatus = async (data: UpdateCommitmentStatus) => {
  await prisma.committedFund.update({
    where: {
      id: data.commitmentId,
    },
    data: {
      status: data.status,
    },
  });
};

export const deleteCommitment = async (data: DeleteCommitment) => {
  await prisma.committedFund.delete({
    where: {
      id: data.commitmentId,
    },
  });
};

export const createDisbursement = async (commitment: CreateDisbursement) => {
  const created = await prisma.disbursement.create({
    data: commitment,
  });
  return created;
};

export const updateDisbursementStatus = async (
  data: UpdateDisbursementStatus
) => {
  await prisma.disbursement.update({
    where: {
      id: data.disbursementId,
    },
    data: {
      status: data.status,
    },
  });
};

export const deleteDisbursement = async (data: DeleteDisbursement) => {
  await prisma.disbursement.delete({
    where: {
      id: data.disbursementId,
    },
  });
};
