import { Router } from 'express';
import { signupPartner } from '../controllers/authController';
import { loginUser } from '../controllers/loginController';

const router = Router();

router.post('/signup/partner', signupPartner);
router.post('/login', loginUser);

export default router;
