import { Router } from 'express';
import * as controller from '../controllers/volunteer.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  VolunteerProjectIdSchema,
  UpdateVolunteerProjectSchema,
  CreateVolunteerProjectSchema,
} from '../schemas/volunteer';

const router = Router();

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

export default router;
