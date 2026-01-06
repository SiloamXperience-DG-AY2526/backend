import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {
  UpdateProposedProjectStatusSchema,
  DonationProjectIdSchema,
  UpdateDonationProjectSchema,
  CreateDonationProjectSchema,
  getDonationProjectsSchema,
} from '../schemas/donation';
import * as donationProjectController from '../controllers/donationProject.controller';
import { requirePermission } from '../middlewares/requirePermission';

const router = Router();

// USE validation middleware for routes with projectId param
router.use(
  ['/:projectId', '/me/:projectId'],
  validateRequest({ params: DonationProjectIdSchema })
);


// GET Donation Projects 
// (column-level access control is checked at service/model layer)
router.get(
  '/',
  validateRequest({ query: getDonationProjectsSchema }),
  donationProjectController.getDonationProjects
);

// GET details for any donation project 
// schema validated above
// permission check: project:view
/**
router.get(
  '/:projectId',
  //TODO: will generalise donationProjectController.getMyDonationProjectDetails
);
 */

router.get(
  '/:projectId/donations',
  donationProjectController.getProjectDonationTransactions
); // TODO: filter by date, pagination

// GET Donation Projects managed by the current user (i.e. donation-project manager/ partner)
// no need permission check: anyone can view own projects
router.get(
  '/me',
  donationProjectController.getMyDonationProjects
);

// GET details for a donation project managed by the current user
// no need permission check: anyone can view own project
router.get(
  '/me/:projectId',
  donationProjectController.getMyDonationProjectDetails
);

// POST create new donation project
// no need permission check: anyone can create
router.post(
  '/',
  validateRequest({ body: CreateDonationProjectSchema }),
  donationProjectController.createDonationProject
);

// PATCH update my own donation project
// no need permission check: anyone can update own project
router.patch(
  '/me/:projectId',
  validateRequest({ body: UpdateDonationProjectSchema }),
  donationProjectController.updateDonationProject
);

// Get proposed projects
router.get(
  '/proposedProjects',
  requirePermission('proposedProjects:view'),
  donationProjectController.getProposedProjects
);

// Change status of proposed project
router.patch(
  '/proposedProjects/:projectId/status',
  requirePermission('proposedProjects:update:status'),
  validateRequest({ params: DonationProjectIdSchema, body: UpdateProposedProjectStatusSchema }),
  donationProjectController.updateProposedProjectStatus
);

export default router;
