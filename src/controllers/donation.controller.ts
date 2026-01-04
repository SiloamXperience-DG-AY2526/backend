import { Request, Response } from 'express';
import * as donationService from '../services/donation.service';
import {
  getDonationHistorySchema,
  submitDonationApplicationSchema,
  donationIdSchema,
} from '../schemas/index';

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
 * POST /donations/applications
 * Body: { projectId, type, countryOfResidence, paymentMode, amount, brickCount? }
 */
export const submitDonationApplication = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user (req.user.id)
  // For now, this should be implemented once auth middleware is in place
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const validatedData = submitDonationApplicationSchema.parse(req.body);
  const donation = await donationService.submitDonationApplication(
    partnerId,
    validatedData
  );

  res.status(201).json({
    message: 'Donation application submitted successfully',
    donation,
  });
};

/**
 * Controller: Get partner's donation history
 * GET /donations/donations?status=pending|completed|cancelled|all&page=1&limit=10
 */
export const getPartnerDonationHistory = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const filters = getDonationHistorySchema.parse({
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  const result = await donationService.getPartnerDonationHistory(partnerId, filters);
  res.json(result);
};

/**
 * Controller: Get donation detail
 * GET /donations/:donationId
 */
export const getDonationDetail = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const { donationId } = donationIdSchema.parse({ donationId: req.params.donationId });
  const donation = await donationService.getDonationDetail(donationId, partnerId);

  res.json(donation);
};

/**
 * Controller: Download donation receipt
 * GET /donations/:donationId/receipt
 * TODO: Implement receipt generation (PDF or similar)
 */
export const downloadDonationReceipt = async (req: Request, res: Response) => {
  // TODO: Get partnerId from authenticated user
  const partnerId = (req as any).user?.id;

  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized: Partner not authenticated' });
    return;
  }

  const { donationId } = donationIdSchema.parse({ donationId: req.params.donationId });
  const donation = await donationService.getDonationDetail(donationId, partnerId);

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
