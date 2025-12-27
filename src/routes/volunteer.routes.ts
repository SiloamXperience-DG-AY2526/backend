import { Router } from 'express';
import { getAvailableVolunteerActivities, getVolunteerApplications, submitVolunteerApplication } from '../controllers/volunteerController';
import { validateRequest } from '../middlewares/validateRequest';
import { GetAvailableVolunteerActivitiesSchema, GetVolunteerApplicationsSchema, SubmitVolunteerApplicationSchema } from '../schemas/volunteer';
import { ProjectIdSchema } from '../schemas';

const router = Router();

router.post(
  '/projects/:projectId/volunteer-application',
  validateRequest({ 
    body: SubmitVolunteerApplicationSchema, 
    params: ProjectIdSchema 
  }),
  submitVolunteerApplication
);
router.get(
  '/application/:userId',
  validateRequest({ params: GetVolunteerApplicationsSchema }),
  getVolunteerApplications
);

router.get(
  '/availableActivities',
  getAvailableVolunteerActivities
);

export default router;
