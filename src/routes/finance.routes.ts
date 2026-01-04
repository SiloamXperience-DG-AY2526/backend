import { Router } from 'express';
import * as controller from '../controllers/finance.controller';
import { validateRequest } from '../middlewares/validateRequest';
import * as schema from '../schemas';
import { requirePermission } from '../middlewares/requirePermission';
import { Permission } from '../authorisation/permissions';

const router = Router();

router.use(
  '/donationProjects/:projectId',
  validateRequest({ params: schema.ProjectIdSchema })
);

//TODO: GET all donor details
//TODO: GET specific donor data
//TODO: update a donation status

//TODO: POST, PUT, DEL a donation_project
//TODO: POST duplicate a donation_project

//TODO: POST, PATCH email templates

//TODO: EXPORT/IMPORT all donor details

// TODO: filter by status, date, shortage, pagination
router.get('/donationProjects', controller.getDonProjects);

router.get('/donationProjects/:projectId', controller.getDonProjectDetails);

router.get(
  '/donationProjects/:projectId/donations',
  controller.getProjectDonationTransactions
); // TODO: filter by date, pagination

router.patch(
  '/donations/:id/receiptStatus',
  controller.updateDonationReceiptStatus
);

// Get proposed projects
router.get(
  '/proposedProjects',
  requirePermission('proposedProjects:view' as Permission),
  controller.getProposedProjects
);

// Change status of proposed project
router.patch(
  '/proposedProjects/:projectId/status',
  requirePermission('proposedProjects:update:status' as Permission),
  validateRequest({ params: schema.ProjectIdSchema, body: schema.UpdateProposedProjectStatusSchema }),
  controller.updateProposedProjectStatus
);

export default router;
