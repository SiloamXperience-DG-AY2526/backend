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

// Apply validation middleware for routes with projectId param
router.use(
  '/projects/:projectId',
  validateRequest({ params: VolunteerProjectIdSchema })
);

// POST create new volunteer project
router.post(
  '/projects',
  requirePermission('volunteer-project:create'),
  validateRequest({ body: CreateVolunteerProjectSchema }),
  controller.createVolunteerProject
);

// GET all volunteer projects for the current project manager
router.get(
  '/projects',
  requirePermission('volunteer-project:view:own'),
  controller.getVolunteerProjects
);

// GET specific volunteer project details
router.get(
  '/projects/:projectId',
  requirePermission('volunteer-project:view:own'),
  controller.getVolunteerProjectDetails
);

// PATCH update volunteer project
router.patch(
  '/projects/:projectId',
  requirePermission('volunteer-project:update:own'),
  validateRequest({ body: UpdateVolunteerProjectSchema }),
  controller.updateVolunteerProject
);

export default router;

