import { z } from 'zod';
import { preprocessDate } from '../helper';

const statuses = [
  'DRAFT',
  'PENDING',
  'APPROVAL',
  'RELEASED',
  'REJECTED',
] as const;

export const CommitmentStatusSchema = z.object({
  status: z.enum(statuses),
});

export const CreateCommitmentSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than 0' }), // Prisma Decimal will handle conversion
  description: z.string().optional(),
  fiscalYear: z.int({ message: 'Fiscal year must be an integer' }).min(1900),
  status: z.enum(statuses),
  createdById: z.uuid({ message: 'Invalid user ID' }),
  approvedById: z.uuid({ message: 'Invalid approver ID' }).optional(),
  approvedAt: preprocessDate,
});

export type CreateCommitment = z.infer<typeof CreateCommitmentSchema> & {
  projectId: string;
};

export type UpdateCommitmentStatus = z.infer<typeof CommitmentStatusSchema> & {
  projectId: string;
  commitmentId: string;
};

export type DeleteCommitment = {
  projectId: string;
  commitmentId: string;
};
