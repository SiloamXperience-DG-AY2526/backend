import { Router } from 'express';
import * as controller from '../controllers/volunteer.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import {
  VolunteerProjectIdSchema,
  UpdateVolunteerProjectSchema,
  CreateVolunteerProjectSchema,
} from '../schemas/volunteer';

const router = Router();

// USE validation middleware for routes with projectId param
router.use(
  '/:projectId',
  validateRequest({ params: VolunteerProjectIdSchema })
);

// POST create new volunteer project
router.post(
  '/',
  requirePermission('volunteer-project:create'),
  validateRequest({ body: CreateVolunteerProjectSchema }),
  controller.createVolunteerProject
);

// GET all volunteer projects for the current user
router.get(
  '/me',
  requirePermission('volunteer-project:view:own'),
  controller.getVolunteerProjects
);

// GET specific volunteer project details for the current user
router.get(
  '/me/:projectId',
  requirePermission('volunteer-project:view:own'),
  controller.getVolunteerProjectDetails
);

// PATCH update volunteer project for the current user
router.patch(
  '/me/:projectId',
  requirePermission('volunteer-project:update:own'),
  validateRequest({ body: UpdateVolunteerProjectSchema }),
  controller.updateVolunteerProject
);

export default router;
