import { Router } from 'express';
import * as controller from '../controllers/general.controller';
import { requirePermission } from '../middlewares/requirePermission';
import { validateRequest } from '../middlewares/validateRequest';
import { VolunteerProjectIdSchema } from '../schemas';

const router = Router();

router.use(
  ['/volunteerProjects/:projectId'],
  validateRequest({ params: VolunteerProjectIdSchema })
);


router.get('/volunteerProjects',
  requirePermission('volunteerProjects:view'),
  controller.getVolProjects);

router.patch('/volunteerProjects/:projectId/status',
  requirePermission('volunteerProjects:manage'),
  controller.updateVolProjectStatus
);

export default router;