import { Router } from 'express';
import { partnerSignup } from '../controllers/authController';
import { userLogin } from '../controllers/loginController';

const router = Router();

router.post('/signup/partner', partnerSignup);
router.post('/login', userLogin);

export default router;
