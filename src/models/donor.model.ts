import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';

/**
 * Get all donors
 */
export const getDonors = async (
  select: Prisma.PartnerSelect,
  where: Prisma.PartnerWhereInput,
  pagination: Pagination
) => {

  const [donors, totalCount] = await Promise.all([
    prisma.partner.findMany({
      where,
      select,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.partner.count({ where }),
  ]);

  return {
    donors,
    totalCount
  };
};

/**
 * Get one donor details
 */
export const getDonorDetails = async (
  select: Prisma.PartnerSelect,
  where: Prisma.PartnerWhereUniqueInput,
) => {

  const donorDetails = prisma.partner.findUnique({
    select,
    where,
  });

  return donorDetails;
};