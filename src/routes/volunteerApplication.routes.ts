import { Router } from 'express';
import * as controller from '../controllers/volunteerApplication.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { AnyVolApplicationsQuerySchema, MyVolApplicationsQuerySchema, SubmitVolunteerApplicationSchema } from '../schemas/project';
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

export default router;
