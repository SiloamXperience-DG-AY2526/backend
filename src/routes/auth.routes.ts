import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { partnerSignupSchema, basicSignupSchema, onboardingSchema, requestPasswordResetSchema, resetPasswordSchema, } from '../schemas/auth';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

// Basic signup - creates User only
router.post(
  '/signup',
  validateRequest({ body: basicSignupSchema }),
  controller.signup
);

// Legacy: Full signup with partner data
router.post(
  '/signup/partner',
  validateRequest({ body: partnerSignupSchema }),
  controller.signupPartner
);

// Complete onboarding - creates Partner profile (requires auth)
router.post(
  '/onboard',
  authenticateJWT,
  validateRequest({ body: onboardingSchema }),
  controller.onboard
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
