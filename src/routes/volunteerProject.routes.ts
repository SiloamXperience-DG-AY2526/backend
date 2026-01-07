import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {  GetVolunteerApplicationsParamsSchema, SubmitVolunteerApplicationSchema, VolunteerProjectIdSchema,
  UpdateVolunteerProjectSchema,
  CreateVolunteerProjectSchema,
  ProposeVolunteerProjectSchema,
  UpdateVolunteerProposalSchema,
  WithdrawVolunteerProposalSchema,
  SubmitVolunteerFeedbackSchema, } from '../schemas/project';


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

router.post(
  '/projects/:projectId/feedback',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: SubmitVolunteerFeedbackSchema,
  }),
  controller.submitVolunteerFeedback
);


//admin
// Apply validation middleware for routes with projectId param
router.use(
  ['/:projectId', '/me/:projectId'],
  validateRequest({ params: VolunteerProjectIdSchema })
);

// POST create new volunteer project
// no need permission check: anyone can create volunteer project
router.post(
  '/',
  validateRequest({ body: CreateVolunteerProjectSchema }),
  controller.createVolunteerProject
);

// GET all volunteer projects for the current user
// no need permission check: anyone can view own volunteer projects
router.get(
  '/me',
  controller.getVolunteerProjects
);

// GET specific volunteer project details for the current user
// no need permission check: anyone can view own volunteer project
router.get(
  '/me/:projectId',
  controller.getVolunteerProjectDetails
);

// PATCH update volunteer project for the current user
// no need permission check: anyone can update own volunteer project
router.patch(
  '/me/:projectId',
  validateRequest({ body: UpdateVolunteerProjectSchema }),
  controller.updateVolunteerProject
);

export default router;
