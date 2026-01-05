import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';
import authRoutes from './auth.routes';
import generalRoutes from './general.routes';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import volunteerRoutes from './volunteer.routes';
import donationRoutes from './donation.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint (Public)
router.get('/health', getHealth);

// Auth routes
router.use('/auth', authRoutes);

// Apply JWT auth to all routes below
router.use(authenticateJWT);
router.use('/finance', financeRoutes);
router.use('/general', generalRoutes);
router.use('/volunteer', volunteerRoutes);
router.use('/donation', donationRoutes);

export default router;
