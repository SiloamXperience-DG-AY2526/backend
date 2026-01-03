import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';
import asyncHandler from 'express-async-handler';

const router = Router();

// 1. Donation Homepage Data (Partner View)
router.get('/home', asyncHandler(donationController.getDonationHomepage));

// 2. Get All Donation Projects
router.get('/projects', asyncHandler(donationController.getAllDonationProjects));

// 3. Submit Donation Application
router.post('/applications', asyncHandler(donationController.submitDonationApplication));

// 4. Get Partner's Donation History (Past / Ongoing)
router.get('/partners/donations', asyncHandler(donationController.getPartnerDonationHistory));

// 5. Donation Detail (Review / Complete Page)
router.get('/:donationId', asyncHandler(donationController.getDonationDetail));

// 6. Download Receipt & Thank-You Note
router.get('/:donationId/receipt', asyncHandler(donationController.downloadDonationReceipt));

export default router;
