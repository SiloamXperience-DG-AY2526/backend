import { Router } from 'express';
import * as controller from '../controllers/staff.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requirePermission } from '../middlewares/requirePermission';
import { createStaffSchema } from '../schemas/staff';

const router = Router();

router.post(
    '/create',
    requirePermission('staff:create'),
    validateRequest({ body: createStaffSchema }),
    controller.createStaff
);

export default router;
