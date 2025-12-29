import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { partnerSignupSchema } from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/signup/partner',
  validateRequest({ body: partnerSignupSchema }),
  controller.signupPartner
);
router.post('/login', controller.loginUser);

export default router;
