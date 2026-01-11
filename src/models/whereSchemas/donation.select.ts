import { DonationReceiptStatus, Prisma, SubmissionStatus } from '@prisma/client';

export const DonationWhereConfirmed = {
  submissionStatus: SubmissionStatus.submitted,
  receiptStatus: DonationReceiptStatus.received,
} satisfies Prisma.DonationTransactionWhereInput;

export const DonationWhereOfUser = (donorId: string) => 
  ({
    donorId,
  }) satisfies Prisma.DonationTransactionWhereInput;
