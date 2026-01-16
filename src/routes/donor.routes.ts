import { Router } from 'express';
import * as controller from '../controllers/donor.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { DonorIdSchema, DonorQuerySchema } from '../schemas';
import { requirePermission } from '../middlewares/requirePermission';

const router = Router();

// GET all donors
// Permission Check: both FM and partner manager can view donors (but diff data access)
router.get(
  '/',
  requirePermission('donorDetails:view'),
  validateRequest({ query: DonorQuerySchema }),
  controller.getDonors
);

router.get(
  '/:donorId',
  requirePermission('donorDetails:view'),
  validateRequest({ params: DonorIdSchema }),
  controller.getDonorDetails
);


export default router;

