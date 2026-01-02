import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';
import authRoutes from './auth.routes';
import { authenticateJWT } from '../middlewares/authenticateJWT';

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

export default router;
