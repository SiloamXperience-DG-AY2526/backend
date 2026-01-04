import { Router } from 'express';
//import { getAvailableVolunteerActivities, getVolunteerApplications, submitVolunteerApplication } from '../controllers/volunteerController';
import { validateRequest } from '../middlewares/validateRequest';
import {  GetVolunteerApplicationsParamsSchema, SubmitVolunteerApplicationSchema } from '../schemas/volunteer';
import { ProjectIdSchema } from '../schemas';
import { getAvailableVolunteerActivities, getVolunteerApplications, submitVolunteerApplication } from '../controllers/volunteerController';

const router = Router();

router.post(
  '/projects/:projectId/application',
  validateRequest({ 
    body: SubmitVolunteerApplicationSchema, 
    params: ProjectIdSchema 
  }),                                 
  submitVolunteerApplication
);

router.get(
  '/:userId/volunteer-applications',
  validateRequest({
    params: GetVolunteerApplicationsParamsSchema,
  }),
  getVolunteerApplications
);
router.get(
  '/projects/available',
  getAvailableVolunteerActivities
);


export default router;
