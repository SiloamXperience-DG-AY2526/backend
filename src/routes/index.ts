import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';
import authRoutes from './auth.routes';
import generalRoutes from './general.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);

// Auth routes
router.use('/auth', authRoutes);
router.use('/finance', financeRoutes);
router.use('/general', generalRoutes);

export default router;
