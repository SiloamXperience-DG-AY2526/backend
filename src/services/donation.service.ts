import * as donationModel from '../models/donation.model';
import {
  SubmitDonationApplicationInput,
  GetDonationHistoryInput,
  UpdateDonationReceiptStatusInput,
} from '../schemas/index';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { buildPagination, calculateSkip } from './paginationHelper';
import { DonationHistoryProjection } from '../models/projectionSchemas/donation.projection';

/**
 * Service: Get user's donation history
 * Returns all donations made by a specific user with status filtering
 */
export const getMyDonationHistory = async (
  partnerId: string,
  filters: GetDonationHistoryInput
) => {
  const { status, page = 1, limit = 10 } = filters;
  const skip = calculateSkip(page, limit);

  // Build where clause based on status
  const where: Prisma.DonationTransactionWhereInput = {
    donorId: partnerId,
    ...(status && status !== 'all' && { receiptStatus: status }),
  };
  //Assign select clause
  const select: Prisma.DonationTransactionSelect = DonationHistoryProjection;
  const { donations, totalCount } = await donationModel.getDonationHistory(where, select, {skip, limit});

  return {
    donations,
    pagination: buildPagination(page, limit, totalCount)
  };
};

/**
 * Service: Get donation detail
 * Returns a single donation transaction with full details
 */
export const getDonationDetail = async (donationId: string, userId: string) => {
  const donation = await donationModel.getDonationDetail(donationId, userId);

  if (!donation) {
    throw new NotFoundError(`Donation ${donationId} not found or access denied`);
  }

  return donation;
};

/**
 * Service: Submit donation application
 * Creates a new donation transaction and handles notifications
 * TODO: Add email notifications for admin and partner
 */
export const submitDonationApplication = async (
  partnerId: string,
  data: SubmitDonationApplicationInput
) => {
  // Validate that project exists and is published
  // This will be handled by foreign key constraint, but we can add explicit check
  const donation = await donationModel.submitDonationApplication(partnerId, data);

  // TODO: Send automated email to partner with payment details (QR code/bank account)
  // TODO: Send automated email to finance manager about new donation application

  return donation;
};

/**
 * Service: Get donation homepage data
 * Returns statistics and featured projects for the donation homepage
 */
export const getDonationHomepageData = async () => {
  return await donationModel.getDonationHomepageData();
};

export const updateDonationReceiptStatus = async (
  data: UpdateDonationReceiptStatusInput
) => {
  await donationModel.updateDonationReceiptStatus(data);
};
