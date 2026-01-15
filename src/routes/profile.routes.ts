import { Router } from 'express';
import * as controller from '../controllers/profile.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { PartnerIdSchema } from '../schemas/user';

const router = Router();

// GET user profile
router.get(
  '/me',
  controller.getUserProfile
);

// GET partner information
router.get(
  '/:partnerId',
  validateRequest({ params: PartnerIdSchema }),
  controller.getComprehensivePartnerInfo
);

// PATCH update user profile
router.patch(
  '/me',
  // different profile schemas are accepted here based on 
  // pseudo-roles (Staff/ Partner), so validation is done later on 
  controller.updateUserProfile
);

export default router;

