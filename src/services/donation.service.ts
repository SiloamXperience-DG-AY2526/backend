import * as donationModel from '../models/donation.model';
import {
  SubmitDonationApplicationInput,
  GetDonationHistoryInput,
} from '../schemas/index';
import { NotFoundError } from '../utils/errors';

/**
 * Service: Get user's donation history
 * Returns all donations made by a specific user with status filtering
 */
export const getMyDonationHistory = async (
  partnerId: string,
  filters: GetDonationHistoryInput
) => {
  return await donationModel.getMyDonationHistory(partnerId, filters);
};

/**
 * Service: Get donation detail
 * Returns a single donation transaction with full details
 */
export const getDonationDetail = async (donationId: string, partnerId: string) => {
  const donation = await donationModel.getDonationDetail(donationId, partnerId);

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