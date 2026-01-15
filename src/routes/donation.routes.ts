import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  submitDonationApplicationSchema,
  getDonationHistorySchema,
  DonationIdSchema,
} from '../schemas/donation';
import { requirePermission } from '../middlewares/requirePermission';

const router = Router();

// USE validation middleware for routes with projectId param
router.use(
  ['/:donationId', '/me/:donationId'],
  validateRequest({ params: DonationIdSchema })
);

// GET Donation History of the current user
// no need permission check: can view own donations
router.get(
  '/me',
  validateRequest({ query: getDonationHistorySchema }),
  donationController.getMyDonationHistory
);

// GET Details for a Donation of current user
// no need permission check: can view own donation
router.get(
  '/me/:donationId',
  donationController.getDonationDetail
);

// GET Receipt for a Donation of the current user
// no need permission check: can view own donation receipts
router.get(
  '/me/:donationId/receipt',
  donationController.downloadDonationReceipt
);

// Get Donation Homepage Data (any user)
// no need permission check: public info
router.get('/home', donationController.getDonationHomepage);

// Apply to make a Donation (to receive the next steps for payment)
// no need permission check: anyone can make a donation request
router.post(
  '/',
  validateRequest({ body: submitDonationApplicationSchema }),
  donationController.submitDonationApplication
);

// Update receipt status for a donation
// permission check: only finance manager and above
router.patch(
  '/:donationId/receiptStatus',
  requirePermission('donationReceiptStatus:update'),
  donationController.updateDonationReceiptStatus
);


export default router;

