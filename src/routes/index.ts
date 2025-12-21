import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';

const router = Router();
router.use(financeRoutes);

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);

router.use('/finance', financeRoutes);

export default router;
