import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {
  VolunteerProjectIdSchema,
  UpdateVolunteerProjectSchema,
  CreateVolunteerProjectSchema,
  ProposeVolunteerProjectSchema,
  UpdateVolunteerProposalSchema,
  WithdrawVolunteerProposalSchema,
  SubmitVolunteerFeedbackSchema,
  MyProjectApplicationsQuerySchema,
  UpdateVolunteerProjectStatusSchema,
} from '../schemas/project';
import * as controller from '../controllers/volunteerProject.controller';
import { requireAnyPermission, requirePermission } from '../middlewares/requirePermission';
const router = Router();

//GET volunteer applications to My own project
// MUST be declared before any `/:projectId` routes,
// otherwise "available" will be treated as a projectId and fail validation else Invalid route parameters

router.get(
  '/available',
  controller.getAvailableVolunteerActivities
);

//QUESTION: who should access this endpoint? volunteers
//GET details of a specific project
router.get(
  '/:projectId/details',
  controller.getVolunteerProjectDetail
);


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

//No need Permission check: all PMs can view applications to his own projects
router.get(
  '/me/:projectId/applications',
  validateRequest({
    query: MyProjectApplicationsQuerySchema,
  }),
  controller.getVolProjectApplications
);


//QUESTION: can this be combined with POST /volunteerProjects/ ? remove proposal ?
//POST submit a new volunteering project for approval
router.post(
  '/proposal',
  validateRequest({ body: ProposeVolunteerProjectSchema }),
  controller.proposeVolunteerProject
);

//QUESTION: can this be converted to PATCH /volunteerProjects/:projectId ? remove proposal ?
//PATCH update a submitted volunteering project
router.patch(
  '/proposal/:projectId',
  validateRequest({
    body: UpdateVolunteerProposalSchema,
  }),
  controller.updateVolunteerProposal
);

// TODO: generalise this to update the status to anything, then fix state transition logic in service/models
//PATCH update status of a submitted volunteering project to withdraw
router.patch(
  '/:projectId/withdraw',
  validateRequest({
    body: WithdrawVolunteerProposalSchema,
  }),
  controller.withdrawVolunteerProposal
);


//POST feedback about a specific project you participated in
//Permission check: only users who were volunteers OR GM and above
router.post(
  '/:projectId/feedbacks',
  validateRequest({ params: VolunteerProjectIdSchema, body: SubmitVolunteerFeedbackSchema }),
  requireAnyPermission(['volunteerProjFeedback:post:own', 'volunteerProjFeedback:post']),
  controller.submitVolunteerFeedback
);


// PATCH update approval status of a volunteering project
// Permission check: only users with 'volunteerProjApproval:update' permission
router.patch('/:projectId/ApprovalStatus',
  validateRequest({
    body: UpdateVolunteerProjectStatusSchema,
  }),
  requirePermission('volunteerProjApproval:update'),
  controller.updateVolProjectStatus
);

// POST duplicate an existing volunteer project
router.post(
  '/:projectId/duplicate',
  requirePermission('volunteerProjects:duplicate'),
  controller.duplicateVolunteerProject
);

export default router;
