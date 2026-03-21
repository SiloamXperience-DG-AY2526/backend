import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';
import { DonorPrivateSummarySelect } from './projectionSchemas/donor.projection';
import { UpdateDonorInput } from '../schemas';

/**
 * Get all donors
 */
export const getDonors = async (
  select: Prisma.PartnerSelect,
  where: Prisma.PartnerWhereInput,
  pagination: Pagination,
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
    totalCount,
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

/**
 * Update donor (Partner + nested User) fields
 */
export const updateDonorById = async (
  donorId: string,
  data: UpdateDonorInput,
) => {
  const {
    title,
    firstName,
    lastName,
    gender,
    dob,
    occupation,
    nationality,
    contactNumber,
    contactModes,
    isActive,
  } = data;

  return prisma.partner.update({
    where: { userId: donorId },
    data: {
      ...(gender !== undefined && { gender }),
      ...(dob !== undefined && { dob }),
      ...(occupation !== undefined && { occupation }),
      ...(nationality !== undefined && { nationality }),
      ...(contactNumber !== undefined && { contactNumber }),
      ...(contactModes !== undefined && {
        contactModes: {
          deleteMany: {},
          createMany: {
            data: contactModes.map((mode) => ({ mode })),
          },
        },
      }),
      user: {
        update: {
          ...(title !== undefined && { title }),
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(isActive !== undefined && { isActive }),
        },
      },
    },
    select: DonorPrivateSummarySelect,
  });
};
