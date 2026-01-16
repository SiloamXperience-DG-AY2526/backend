import { Prisma } from '@prisma/client';

const DonationBaseProjection = {
  id: true,
  donorId: true,
  projectId: true,
  recurringDonationId: true,
  type: true,
  countryOfResidence: true,
  paymentMode: true,
  date: true,
  amount: true,
  receipt: true,
  submissionStatus: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DonationTransactionSelect;

export const DonationHistoryProjection = {
  ...DonationBaseProjection,
  project: {
    select: {
      id: true,
      title: true,
      location: true,
      image: true,
      type: true,
      brickSize: true,
    },
  },

} satisfies Prisma.DonationTransactionSelect;