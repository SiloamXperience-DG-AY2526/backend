import { Prisma } from '@prisma/client';

export const DonorWhereOfOwnProject = (managerId: string) =>
  ({
    user: {
      donorTransactions: {
        some: {
          project: {
            managedBy: managerId,
          }
        },
      },
    },
  }) satisfies Prisma.PartnerWhereInput;

export const DonorDetailsWhereOfId = (donorId: string) =>
  ({
    userId: donorId,
  }) satisfies Prisma.PartnerWhereUniqueInput;
