import { Router } from 'express';
import * as controller from '../controllers/volunteerApplication.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { GetVolunteerApplicationsQuerySchema, SubmitVolunteerApplicationSchema } from '../schemas/project';
const router = Router();

//GET any user's application
//Filter by projectId, user, status
//Permission check: Only General manager can view all
// router.get(
//   '/',
//   requirePermission('volunteerProjectApplications:view:all'),
//   validateRequest({
//     query: GetAnyVolApplicationsQuerySchema,
//   }),
//   controller.getVolunteerApplications
// );

//GET only applications of your own project
//Filter by user, status
//No need Permission check: all PMs can view applications to his own projects
// router.get(
//   '/me/:projectId/applications',
//   validateRequest({
//     query: GetVolunteerApplicationsQuerySchema,
//   }),
//   controller.getVolunteerApplications
// );
// export default router;


//GET ALL of your own applications
//Query by status
//No need Permission check: all users can view his own applications
router.get(
  '/me',
  validateRequest({ query: GetVolunteerApplicationsQuerySchema}),                                 
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
