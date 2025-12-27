import { Router } from 'express';
import { getAvailableVolunteerActivities, getVolunteerApplications, submitVolunteerApplication } from '../controllers/volunteerController';
import { validateRequest } from '../middlewares/validateRequest';
import { GetVolunteerApplicationsSchema, SubmitVolunteerApplicationSchema } from '../schemas/volunteer';
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
// http://localhost:3000/api/v1/volunteer/projects/available?page=1&limit=5&search=community
router.get(
  '/projects/available',
  getAvailableVolunteerActivities
);

export default router;
