import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {
  VolunteerProjectIdSchema,
  UpdateVolunteerProjectSchema,
  CreateVolunteerProjectSchema,
  SubmitVolunteerApplicationSchema,
  ProposeVolunteerProjectSchema,
  UpdateVolunteerProposalSchema,
  WithdrawVolunteerProposalSchema,
  SubmitVolunteerFeedbackSchema,
  GetVolunteerApplicationsQuerySchema,
} from '../schemas/project';
import * as controller from '../controllers/volunteerProject.controller';
import { requirePermission } from '../middlewares/requirePermission';
const router = Router();

// USE validation middleware for routes with projectId param
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


// FIXING
// POST submit a volunteering application
router.post(
  '/:projectId/applications',
  validateRequest({ body: SubmitVolunteerApplicationSchema}),                                 
  controller.submitVolunteerApplication
);

//GET any user's application
//Filter by user, status
//Permission check: Only General manager can view all
router.get(
  '/:projectId/applications',
  requirePermission('volunteerProjectApplications:view:all'),
  validateRequest({
    query: GetVolunteerApplicationsQuerySchema,
  }),
  controller.getVolunteerApplications
);

//GET only applications of your own project
//Filter by user, status
//No need Permission check: all PMs can view applications to his own projects
router.get(
  '/me/:projectId/applications',
  validateRequest({
    query: GetVolunteerApplicationsQuerySchema,
  }),
  controller.getVolunteerApplications
);

//GET any project public info
// Filter: status == available
router.get(
  '/available',
  controller.getAvailableVolunteerActivities
);

//POST submit a new volunteering project for approval
router.post(
  '/project/proposal',
  validateRequest({ body: ProposeVolunteerProjectSchema }),
  controller.proposeVolunteerProject
);

//PATCH update a submitted volunteering project
router.patch(
  '/project/proposal/:projectId',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: UpdateVolunteerProposalSchema,
  }),
  controller.updateVolunteerProposal
);

//PATCH update status of a submitted volunteering project to withdraw
router.patch(
  '/project/proposal/:projectId/withdraw',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: WithdrawVolunteerProposalSchema,
  }),
  controller.withdrawVolunteerProposal
);

//GET details of a specific project
router.get(
  '/projects/:projectId/details',
  validateRequest({ params: VolunteerProjectIdSchema }),
  controller.getVolunteerProjectDetail
);

//POST feedback about a specific project
router.post(
  '/projects/:projectId/feedback',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: SubmitVolunteerFeedbackSchema,
  }),
  controller.submitVolunteerFeedback
);

export default router;
