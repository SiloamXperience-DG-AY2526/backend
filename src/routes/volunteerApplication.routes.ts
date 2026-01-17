import { Router } from 'express';
import * as controller from '../controllers/volunteerApplication.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { AnyVolApplicationsQuerySchema, SubmitVolunteerApplicationSchema, MatchVolunteerToProjectSchema, ApproveVolunteerMatchSchema, MatchIdSchema, MyVolApplicationsQuerySchema } from '../schemas/project';
import { requirePermission } from '../middlewares/requirePermission';
const router = Router();

// GET any user's application
// Filter by {user, projectId, status}
// Permission check: Only General manager can view all
router.get(
  '/',
  validateRequest({
    query: AnyVolApplicationsQuerySchema,
  }),
  requirePermission('volunteerApplications:view:all'),
  controller.getVolunteerApplications
);

//GET ALL of your own applications
//Query by status
//No need Permission check: all users can view his own applications
//ValidateRequest causes: Cannot set property query of #<IncomingMessage> which has only a getter 
//did the checking in controller instread
router.get(
  '/me',          
  validateRequest({ query: MyVolApplicationsQuerySchema}),                                       
  controller.getMyVolunteerApplications
);


// TODO FIX: the Input Schema to also include date and time chosen
// POST submit your own volunteering application
// req.body: hasConsented, positionId
router.post(
  '/me/applications',
  validateRequest({ body: SubmitVolunteerApplicationSchema}),                                 
  controller.submitVolunteerApplication
);

// POST match a volunteer to a project
// req.body: { volunteerId, projectId, positionId? }
// Match is subject to approval (status: reviewing)
router.post(
  '/match',
  validateRequest({ body: MatchVolunteerToProjectSchema }),
  controller.matchVolunteerToProject
);

// PATCH approve a volunteer match
// req.params: { matchId }
// req.body: { approvalNotes?, approvalMessage? }
router.patch(
  '/:matchId/approve',
  validateRequest({ 
    params: MatchIdSchema,
    body: ApproveVolunteerMatchSchema 
  }),
  controller.approveVolunteerMatch
);

export default router;
