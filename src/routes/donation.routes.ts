import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  submitDonationApplicationSchema,
  getDonationHistorySchema,
  donationIdSchema,
} from '../schemas/donation';

const router = Router();

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
  validateRequest({ params: donationIdSchema }),
  donationController.getDonationDetail
);

// GET Receipt for a Donation of the current user
// no need permission check: can view own donation receipts
router.get(
  '/me/:donationId/receipt',
  validateRequest({ params: donationIdSchema }),
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

export default router;

