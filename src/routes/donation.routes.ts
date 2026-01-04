import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';

const router = Router();

// GET Donation History of the current user
router.get('/me', donationController.getMyDonationHistory);

// GET Details for a Donation of current user
router.get('/me/:donationId', donationController.getDonationDetail);

// GET Receipt for a Donation of the current user
router.get('/me/:donationId/receipt', donationController.downloadDonationReceipt);

// Get Donation Homepage Data (any user)
router.get('/home', donationController.getDonationHomepage);

// Apply to make a Donation (to receive the next steps for payment)
router.post('/', donationController.submitDonationApplication);

export default router;

