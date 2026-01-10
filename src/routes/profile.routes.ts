import { Router } from 'express';
import * as controller from '../controllers/profile.controller';

const router = Router();

// GET user profile
router.get(
  '/me',
  controller.getUserProfile
);

// PATCH update user profile
router.patch(
  '/me',
  // different profile schemas are accepted here based on 
  // pseudo-roles (Staff/ Partner), so validation is done later on 
  controller.updateUserProfile
);

export default router;

