import { Prisma, UserRole } from '@prisma/client';
import { buildPagination, calculateSkip } from './paginationHelper';
import { PartnerQueryType } from '../schemas/user';
import * as partnerModel from '../models/partner.model';

export const getPartners = async (filters: PartnerQueryType) => {
  const { page, limit, search } = filters;
  const pageValue = typeof page === 'number' ? page : Number(page) || 1;
  const limitValue = typeof limit === 'number' ? limit : Number(limit) || 10;
  const skip = calculateSkip(pageValue, limitValue);

  const where: Prisma.PartnerWhereInput = {
    user: {
      role: UserRole.partner,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
  };

  const select: Prisma.PartnerSelect = {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
    },
    countryCode: true,
    contactNumber: true,
    nationality: true,
    occupation: true,
    volunteerAvailability: true,
    hasVolunteerExperience: true,
    gender: true,
  };

  const { partners, totalCount } = await partnerModel.getPartners(select, where, {
    skip,
    limit: limitValue,
  });

  const items = partners.map((partner) => ({
    partnerId: partner.user.id,
    fullName: `${partner.user.firstName} ${partner.user.lastName}`.trim(),
    email: partner.user.email,
    contactNumber:
      partner.countryCode && partner.contactNumber
        ? `${partner.countryCode}${partner.contactNumber}`
        : '',
    nationality: partner.nationality ?? null,
    occupation: partner.occupation ?? null,
    volunteerAvailability: partner.volunteerAvailability ?? null,
    hasVolunteerExperience: partner.hasVolunteerExperience ?? false,
    gender: partner.gender ?? null,
    status: partner.user.isActive ? 'Active' : 'Inactive',
  }));

  return {
    partners: items,
    pagination: buildPagination(pageValue, limitValue, totalCount),
  };
};
