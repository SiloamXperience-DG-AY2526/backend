import { Router } from 'express';
import * as controller from '../controllers/staff.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import { createStaffSchema, staffIdSchema } from '../schemas/staff';

const router = Router();

router.get(
  '/',
  requirePermission('staff:read'),
  controller.getAllStaff
);

router.post(
  '/create',
  requirePermission('staff:create'),
  validateRequest({ body: createStaffSchema }),
  controller.createStaff
);

// TODO: (INCOMPLETE) Reconsider the implementation due to many factors such as projects still being assigned
// Currently it is implemented such that the isActivate status is set to FALSE as derived from frontend figma design
router.put(
  '/deactivate/:staffId',
  requirePermission('staff:deactivate'),
  validateRequest({ params: staffIdSchema }),
  controller.deactivateStaff
);

// TODO: (INCOMPLETE) Reconsider the implementation due to many factors such as projects still being assigned
// Currently it is implemented such that the isActivate status is set to TRUE as derived from frontend figma design
router.put(
  '/activate/:staffId',
  requirePermission('staff:activate'),
  validateRequest({ params: staffIdSchema }),
  controller.activateStaff
);

export default router;
