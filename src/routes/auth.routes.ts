import { Router } from 'express';
import * as controller from '../controllers/auth.controller';

const router = Router();

router.post('/signup/partner', controller.signupPartner);
router.post('/login', controller.loginUser);

export default router;
