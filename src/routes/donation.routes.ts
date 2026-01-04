import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';
import * as controller from '../controllers/donation.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import {
  DonationProjectIdSchema,
  UpdateDonationProjectSchema,
  CreateDonationProjectSchema,
} from '../schemas/donation';

const router = Router();

// 1. Donation Homepage Data (Partner View)
router.get('/home', donationController.getDonationHomepage);

// 2. Get All Donation Projects
router.get('/projects', donationController.getAllDonationProjects);

// 3. Submit Donation Application
router.post('/applications', donationController.submitDonationApplication);

// 4. Get Partner's Donation History (Past / Ongoing)
router.get('/partners/donations', donationController.getPartnerDonationHistory);

// 5. Donation Detail (Review / Complete Page)
router.get('/:donationId', donationController.getDonationDetail);

// 6. Download Receipt & Thank-You Note
router.get('/:donationId/receipt', donationController.downloadDonationReceipt);

// Apply validation middleware for routes with projectId param
router.use(
  '/projects/:projectId',
  validateRequest({ params: DonationProjectIdSchema })
);

// POST create new donation project
router.post(
  '/projects',
  requirePermission('donation-project:create'),
  validateRequest({ body: CreateDonationProjectSchema }),
  controller.createDonationProject
);

// GET all donation projects for the current project manager
router.get(
  '/projects',
  requirePermission('donation-project:view:own'),
  controller.getDonationProjects
);

// GET specific donation project details
router.get(
  '/projects/:projectId',
  requirePermission('donation-project:view:own'),
  controller.getDonationProjectDetails
);

// PATCH update donation project
router.patch(
  '/projects/:projectId',
  requirePermission('donation-project:update:own'),
  validateRequest({ body: UpdateDonationProjectSchema }),
  controller.updateDonationProject
);

export default router;

