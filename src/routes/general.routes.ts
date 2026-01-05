import { Router } from 'express';
import * as controller from '../controllers/general.controller';
import { requirePermission } from '../middlewares/requirePermission';

const router = Router();

router.get('/volunteerProjects',
  requirePermission('view_volunteer_projects'),
  controller.getVolProjects);

export default router;