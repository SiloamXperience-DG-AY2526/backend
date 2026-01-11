import { buildPagination, calculateSkip } from './paginationHelper';
import { JwtPayload } from '../utils/jwt';
import { DonorDetailQueryType, DonorQueryType } from '../schemas';
import { Prisma, SubmissionStatus, UserRole } from '@prisma/client';
import { DonorPrivateSummarySelect, DonorPublicSummarySelect } from '../models/projectionSchemas/donor.projection';
import * as donorModel from '../models/donor.model';
import * as donationModel from '../models/donation.model';
import { DonorDetailsWhereOfId, DonorWhereOfOwnProject } from '../models/whereSchemas/donor.select';
import { DonationWhereOfUser } from '../models/whereSchemas/donation.select';
import { DonationHistoryProjection } from '../models/projectionSchemas/donation.projection';

/**
 * Service: Get all donors paginated
 * Returns all donors with status filtering
 */
export const getDonors = async (
  userPayload: JwtPayload,
  filters: DonorQueryType
) => {
  const { page, limit } = filters;
  const skip = calculateSkip(page, limit);
  const {userId, role} = userPayload;

  let select: Prisma.PartnerSelect = {};
  let where: Prisma.PartnerWhereInput = {};
  
  if (role == UserRole.financeManager) {
    //can access sensitive info
    select = DonorPrivateSummarySelect;
    where = {};
  } else {
    // PMs - only donors of own donation projects
    select = DonorPublicSummarySelect;
    where = DonorWhereOfOwnProject(userId);
  }

  const { donors, totalCount } = await donorModel.getDonors(select, where, {skip, limit});
  
  const donorIds = donors.map(d => d.id);

  const donations = await donationModel.getCumulativeDonations(donorIds);

  const donorsWithTotals = donors.map(donor => {
    const donation = donations.find(d => d.donorId === donor.id);
    return {
      ...donor,
      totalDonations: donation?._sum.amount ?? 0,
    };
  });  

  return {
    donorsWithTotals,
    pagination: buildPagination(page, limit, totalCount)
  };
};

/**
 * Service: Get donor details
 */
export const getDonorDetails = async (
  _userPayload: JwtPayload,
  donationFilters: DonorDetailQueryType,
) => {
  const { donorId, page, limit } = donationFilters;
  const skip = calculateSkip(page, limit);

  //build donor query
  const selectDonor: Prisma.PartnerSelect = DonorPrivateSummarySelect;
  const whereDonor: Prisma.PartnerWhereUniqueInput = DonorDetailsWhereOfId(donorId);

  const donorDetails = await donorModel.getDonorDetails(selectDonor, whereDonor);
  //build donation history query
  const selectHistory: Prisma.DonationTransactionSelect = DonationHistoryProjection;
  const whereHistory: Prisma.DonationTransactionWhereInput = {
    ...DonationWhereOfUser(donorId),
    NOT: {
      submissionStatus: SubmissionStatus.draft,
    }
  };

  const {donations, totalCount} = await donationModel.getDonationHistory(whereHistory, selectHistory, {skip, limit});

  const donationHistory = {
    donations,
    pagination: buildPagination(page, limit, totalCount)
  };

  return {
    donorDetails,
    donationHistory
  };
};