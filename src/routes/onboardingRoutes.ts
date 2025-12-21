import { Router } from 'express';
import { getMyPartnerOnboarding } from '../controllers/onboardingController';

const router = Router();

router.get('/partner/onboarding', getMyPartnerOnboarding);

export default router;
