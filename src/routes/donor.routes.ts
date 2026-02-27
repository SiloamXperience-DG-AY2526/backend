import { Router } from 'express';
import * as controller from '../controllers/donor.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { DonorIdSchema, DonorQuerySchema, UpdateDonorSchema } from '../schemas';
import { requirePermission } from '../middlewares/requirePermission';

const router = Router();

// GET all donors
// Permission Check: both FM and partner manager can view donors (but diff data access)
router.get(
  '/',
  requirePermission('donorDetails:view'),
  validateRequest({ query: DonorQuerySchema }),
  controller.getDonors,
);

router.get(
  '/:donorId',
  requirePermission('donorDetails:view'),
  validateRequest({ params: DonorIdSchema }),
  controller.getDonorDetails,
);

router.patch(
  '/:donorId',
  requirePermission('donorDetails:manage'),
  validateRequest({ params: DonorIdSchema, body: UpdateDonorSchema }),
  controller.updateDonor,
);

export default router;
