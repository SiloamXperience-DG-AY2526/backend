import { Router } from 'express';
import * as controller from '../controllers/staff.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import { createStaffSchema, staffIdSchema } from '../schemas/staff';

const router = Router();

router.post(
    '/create',
    requirePermission('staff:create'),
    validateRequest({ body: createStaffSchema }),
    controller.createStaff
);

router.delete(
    '/remove/:staffId',
    requirePermission('staff:remove'),
    validateRequest({ params: staffIdSchema }),
    controller.removeStaff
);

export default router;
