import { z } from 'zod';
import { preprocessDate } from '../helper';

const statuses = [
  'DRAFT',
  'PENDING',
  'APPROVAL',
  'RELEASED',
  'REJECTED',
] as const;

export const DisbursementStatusSchema = z.object({
  status: z.enum(statuses),
});

export const CreateDisbursementSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  description: z.string().optional(),
  fiscalYear: z.int({ message: 'Fiscal year must be an integer' }).min(1900),
  status: z.enum(statuses),
  createdById: z.uuid({ message: 'Invalid user ID' }),
  approvedById: z.uuid({ message: 'Invalid approver ID' }).optional(),
  approvedAt: preprocessDate,
  disbursedAt: preprocessDate,
});

export type CreateDisbursement = z.infer<typeof CreateDisbursementSchema> & {
  projectId: string;
};

export type UpdateDisbursementStatus = z.infer<
  typeof DisbursementStatusSchema
> & {
  projectId: string;
  disbursementId: string;
};

export type DeleteDisbursement = {
  projectId: string;
  disbursementId: string;
};
