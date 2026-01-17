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
  validateRequest({ params: DonationProjectIdSchema }),
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
  validateRequest({ params: DonationProjectIdSchema }),
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
  validateRequest({ params: DonationProjectIdSchema, body: UpdateDonationProjectSchema }),
  donationProjectController.updateDonationProject
);

// POST withdraw my own donation project (changed from DELETE to POST)
// no need permission check: anyone can withdraw own project
router.post(
  '/me/:projectId/withdraw',
  validateRequest({ params: DonationProjectIdSchema }),
  donationProjectController.withdrawDonationProject
);

// ===== Finance Manager Routes (Outside Partner Scope) =====
// Get proposed projects
// router.get(
//   '/proposedProjects',
//   requirePermission('proposedProjects:view'),
//   donationProjectController.getProposedProjects
// );

// Change status of proposed project
// router.patch(
//   '/proposedProjects/:projectId/approvalStatus',
//   requirePermission('proposedProjects:update:status'),
//   validateRequest({ params: DonationProjectIdSchema, body: UpdateProposedProjectStatusSchema }),
//   donationProjectController.updateProposedProjectStatus
// );

export default router;
