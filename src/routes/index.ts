import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';
import authRoutes from './auth.routes';
import volunteerRoutes from './volunteer.routes';
import donationRoutes from './donation.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);

// Auth routes
router.use('/auth', authRoutes);
router.use('/finance', financeRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/donations', donationRoutes);

export default router;
