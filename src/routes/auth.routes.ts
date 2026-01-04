import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { partnerSignupSchema, requestPasswordResetSchema, resetPasswordSchema, } from '../schemas/auth';

const router = Router();

router.post(
  '/signup/partner',
  validateRequest({ body: partnerSignupSchema }),
  controller.signupPartner
);
router.post('/login', controller.loginUser);

router.post(
  '/request-password-reset', 
  validateRequest({ body: requestPasswordResetSchema }),
  controller.requestPasswordReset);

router.post(
  '/reset-password', 
  validateRequest({ body: resetPasswordSchema }), 
  controller.resetPassword
);

export default router;
