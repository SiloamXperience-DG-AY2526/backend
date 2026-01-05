import { Request, Response } from 'express';
import * as donationService from '../services/donation.service';
import {
  getDonationHistorySchema,
  donationIdSchema,
} from '../schemas/index';
import { getUserIdFromRequest } from '../utils/user';

/**
 * Controller: Get donation homepage data
 * GET /donations/home
 */
export const getDonationHomepage = async (req: Request, res: Response) => {
  const homepageData = await donationService.getDonationHomepageData();
  res.json(homepageData);
};

/**
 * Controller: Submit donation application
 * POST /donations
 * Body: { projectId, type, countryOfResidence, paymentMode, amount, brickCount? }
 */
export const submitDonationApplication = async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const {donationApplicationData} = req.body;
  const donation = await donationService.submitDonationApplication(
    userId,
    donationApplicationData
  );

  res.status(201).json({
    message: 'Donation application submitted successfully',
    donation,
  });
};

/**
 * Controller: Get user's donation history
 * GET /donations/me?status=pending|completed|cancelled|all&page=1&limit=10
 */
export const getMyDonationHistory = async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const filters = getDonationHistorySchema.parse({
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  const result = await donationService.getMyDonationHistory(userId, filters);
  res.json(result);
};

/**
 * Controller: Get donation details of current user
 * GET /donations/me/:donationId
 */
export const getDonationDetail = async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const { donationId } = donationIdSchema.parse({ donationId: req.params.donationId });
  const donation = await donationService.getDonationDetail(donationId, userId);

  res.json(donation);
};

/**
 * Controller: Download donation receipt for current user
 * GET /donations/me/:donationId/receipt
 * TODO: Implement receipt generation (PDF or similar)
 */
export const downloadDonationReceipt = async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const { donationId } = donationIdSchema.parse({ donationId: req.params.donationId });
  const donation = await donationService.getDonationDetail(donationId, userId);

  // Check if receipt is available (donation must be received/completed)
  if (donation.receiptStatus !== 'received') {
    res.status(400).json({
      error: 'Receipt not available. Donation must be confirmed by finance manager first.',
    });
    return;
  }

  // TODO: Generate and return PDF receipt
  // For now, return the receipt URL if it exists
  if (donation.receipt) {
    res.json({
      receiptUrl: donation.receipt,
      message: 'Receipt available',
    });
    return;
  }

  res.status(404).json({ error: 'Receipt not yet generated' });
};
