import { z } from 'zod';
import { DonationType } from '@prisma/client';

// Schema for submitting a donation application
export const submitDonationApplicationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  type: z.enum(DonationType),
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val > 0, 'Amount must be positive'),
  // Optional: brick count for brick-by-brick donations
  brickCount: z.number().int().positive().optional(),
});

export type SubmitDonationApplicationInput = z.infer<
  typeof submitDonationApplicationSchema
>;

// Schema for getting donation history with filters
export const getDonationHistorySchema = z.object({
  status: z
    .enum(['pending', 'completed', 'cancelled', 'all'])
    .optional()
    .default('all'),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .or(z.number())
    .optional()
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .or(z.number())
    .optional()
    .default(10),
});

export type GetDonationHistoryInput = z.infer<typeof getDonationHistorySchema>;

// Schema for donation detail params
export const donationIdSchema = z.object({
  donationId: z.string().uuid('Invalid donation ID'),
});

export type DonationIdInput = z.infer<typeof donationIdSchema>;
