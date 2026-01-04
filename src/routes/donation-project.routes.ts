import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import {
  DonationProjectIdSchema,
  UpdateDonationProjectSchema,
  CreateDonationProjectSchema,
} from '../schemas/donation';
import * as donationProjectController from '../controllers/donationProject.controller';

const router = Router();

// USE validation middleware for routes with projectId param
router.use(
  '/:projectId',
  validateRequest({ params: DonationProjectIdSchema })
);


// GET all Donation Projects
router.get('/', donationProjectController.getAllDonationProjects);

// GET all donation projects managed by the current user (i.e. donation-project manager/ partner)
router.get(
  '/me',
  requirePermission('donation-project:view:own'),
  donationProjectController.getDonationProjects
);

// GET details for a donation project managed by the current user
router.get(
  '/me/:projectId',
  requirePermission('donation-project:view:own'),
  donationProjectController.getDonationProjectDetails
);

// POST create new donation project
router.post(
  '/',
  requirePermission('donation-project:create'),
  validateRequest({ body: CreateDonationProjectSchema }),
  donationProjectController.createDonationProject
);

// PATCH update a specific donation project
router.patch(
  '/me/:projectId',
  requirePermission('donation-project:update:own'),
  validateRequest({ body: UpdateDonationProjectSchema }),
  donationProjectController.updateDonationProject
);

export default router;
