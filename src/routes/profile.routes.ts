import { Router } from 'express';
import * as controller from '../controllers/profile.controller';

const router = Router();

// GET user profile
router.get(
  '/:userId',
  controller.getUserProfile
);

// PATCH update user profile
router.patch(
  '/:userId',
  // different profile schemas are accepted here based on 
  // pseudo-roles (Staff/ Partner), so validation is done later on 
  controller.updateUserProfile
);

export default router;

