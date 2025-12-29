import { z } from 'zod';
import { DonationReceiptStatus } from '@prisma/client'; // your Prisma enum

// zod object
export const UpdateDonationReceiptStatusSchema = z.object({
  donationId: z.uuid(),
  receiptStatus: z.enum(DonationReceiptStatus),
});

// static typing
export type UpdateDonationReceiptStatusInput = z.infer<
  typeof UpdateDonationReceiptStatusSchema
>;
