import { Router } from 'express';
//import { getAvailableVolunteerActivities, getVolunteerApplications, submitVolunteerApplication } from '../controllers/volunteerController';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import {  GetVolunteerApplicationsParamsSchema, SubmitVolunteerApplicationSchema, VolunteerProjectIdSchema,
  UpdateVolunteerProjectSchema,
  CreateVolunteerProjectSchema,
  ProposeVolunteerProjectSchema,
  UpdateVolunteerProposalSchema,
  WithdrawVolunteerProposalSchema, } from '../schemas/volunteer';


import * as controller from '../controllers/volunteer.controller';
const router = Router();

//partner
//submit application (partner)
router.post(
  '/projects/:projectId/application',
  validateRequest({ 
    body: SubmitVolunteerApplicationSchema, 
    params: VolunteerProjectIdSchema 
  }),                                 
  controller.submitVolunteerApplication
);
//get user application
router.get(
  '/:userId/volunteer-applications',
  validateRequest({
    params: GetVolunteerApplicationsParamsSchema,
  }),
  controller.getVolunteerApplications
);
//get projects available
router.get(
  '/projects/available',
  controller.getAvailableVolunteerActivities
);

router.post(
  '/project/proposal',
  validateRequest({ body: ProposeVolunteerProjectSchema }),
  controller.proposeVolunteerProject
);

router.patch(
  '/project/proposal/:projectId',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: UpdateVolunteerProposalSchema,
  }),
  controller.updateVolunteerProposal
);

router.patch(
  '/project/proposal/:projectId/withdraw',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: WithdrawVolunteerProposalSchema,
  }),
  controller.withdrawVolunteerProposal
);

router.get(
  '/projects/:projectId/details',
  validateRequest({ params: VolunteerProjectIdSchema }),
  controller.getVolunteerProjectDetail
);
//admin
// Apply validation middleware for routes with projectId param
router.use(
  '/projects/:projectId',
  validateRequest({ params: VolunteerProjectIdSchema })
);

// POST create new volunteer project
router.post(
  '/projects',
  requirePermission('volunteer-project:create'),
  validateRequest({ body: CreateVolunteerProjectSchema }),
  controller.createVolunteerProject
);

// GET all volunteer projects for the current project manager
router.get(
  '/projects',
  requirePermission('volunteer-project:view:own'),
  controller.getVolunteerProjects
);

// GET specific volunteer project details
router.get(
  '/projects/:projectId',
  requirePermission('volunteer-project:view:own'),
  controller.getVolunteerProjectDetails
);

// PATCH update volunteer project
router.patch(
  '/projects/:projectId',
  requirePermission('volunteer-project:update:own'),
  validateRequest({ body: UpdateVolunteerProjectSchema }),
  controller.updateVolunteerProject
);

export default router;

