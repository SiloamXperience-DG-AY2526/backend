import { Router } from 'express';
import * as controller from '../controllers/donation.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import {
  DonationProjectIdSchema,
  UpdateDonationProjectSchema,
  CreateDonationProjectSchema,
} from '../schemas/donation';

const router = Router();

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

