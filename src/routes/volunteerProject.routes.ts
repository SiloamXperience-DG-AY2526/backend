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
  ViewMyProposedProjectsQuerySchema,
  UpdateMyProposedProjectStatusSchema,
  GetAllVolunteerProjectsSchema,
} from '../schemas/project';
import { PartnerIdSchema } from '../schemas/user';
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

router.get(
  '/all',
  validateRequest({ query: GetAllVolunteerProjectsSchema }),
  controller.getAllVolunteerProjects
);



router.post(
  '/proposal',
  validateRequest({ body: ProposeVolunteerProjectSchema }),
  controller.proposeVolunteerProject
);

router.get(
  '/proposal/me',
  validateRequest({ query: ViewMyProposedProjectsQuerySchema }),
  controller.viewMyProposedProjects
);

router.get(
  '/partner/:partnerId/proposals',
  requirePermission('volunteerProjects:manage'),
  validateRequest({ params: PartnerIdSchema }),
  controller.getPartnerProposedProjects
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
  validateRequest({ params: VolunteerProjectIdSchema }),
  controller.getVolunteerProjectDetails
);

// PATCH update volunteer project for the current user
// no need permission check: anyone can update own volunteer project
router.patch(
  '/me/:projectId',
  validateRequest({ params: VolunteerProjectIdSchema, body: UpdateVolunteerProjectSchema }),
  controller.updateVolunteerProject
);

//No need Permission check: all PMs can view applications to his own projects
router.get(
  '/me/:projectId/applications',
  validateRequest({
    params: VolunteerProjectIdSchema,
    query: MyProjectApplicationsQuerySchema,
  }),
  controller.getVolProjectApplications
);


//QUESTION: who should access this endpoint? volunteers
//GET details of a specific project
router.get(
  '/:projectId/details',
  validateRequest({ params: VolunteerProjectIdSchema }),
  controller.getVolunteerProjectDetail
);
// PATCH update volunteer project by id (admin/general manager)
router.patch(
  '/:projectId',
  validateRequest({ params: VolunteerProjectIdSchema, body: UpdateVolunteerProjectSchema }),
  requirePermission('volunteerProjects:manage'),
  controller.updateVolunteerProjectById
);
//QUESTION: can this be converted to PATCH /volunteerProjects/:projectId ? remove proposal ? edit function
//PATCH update a submitted volunteering project

router.patch(
  '/proposal/:projectId',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: UpdateVolunteerProposalSchema,
  }),
  controller.updateVolunteerProposal
);

// TODO: generalise this to update the status to anything, then fix state transition logic in service/models
//PATCH update status of a submitted volunteering project to withdraw
router.patch(
  '/:projectId/withdraw',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: WithdrawVolunteerProposalSchema,
  }),
  controller.withdrawVolunteerProposal
);

//Update project status
router.patch(
  '/:projectId/proposal/status',
  validateRequest({ params: VolunteerProjectIdSchema, body: UpdateMyProposedProjectStatusSchema }),
  controller.updateMyProposedProjectStatus
);

//POST feedback about a specific project you participated in
//Permission check: only users who were volunteers OR GM and above
router.post(
  '/:projectId/feedbacks',
  validateRequest({ params: VolunteerProjectIdSchema, body: SubmitVolunteerFeedbackSchema }),
  validateRequest({ params: VolunteerProjectIdSchema, body: SubmitVolunteerFeedbackSchema }),
  requireAnyPermission(['volunteerProjFeedback:post:own', 'volunteerProjFeedback:post']),
  controller.submitVolunteerFeedback
);



// PATCH update approval status of a volunteering project
// Permission check: only users with 'volunteerProjApproval:update' permission
router.patch('/:projectId/ApprovalStatus',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: UpdateVolunteerProjectStatusSchema,
  }),
  requirePermission('volunteerProjApproval:update'),
  controller.updateVolProjectStatus
);

// POST duplicate an existing volunteer project
router.post(
  '/:projectId/duplicate',
  validateRequest({ params: VolunteerProjectIdSchema }),
  requirePermission('volunteerProjects:duplicate'),
  controller.duplicateVolunteerProject
);



export default router;



//Update project status
router.patch(
  '/proposal/me/:projectId/status',
  validateRequest({
    params: VolunteerProjectIdSchema,
    body: UpdateMyProposedProjectStatusSchema,
  }),
  controller.updateMyProposedProjectStatus
);
