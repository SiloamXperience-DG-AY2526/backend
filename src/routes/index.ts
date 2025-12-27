import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';

import financeRoutes from './finance.routes';
import volunteerRoutes from './volunteer.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);






router.use('/finance', financeRoutes);
router.use('/volunteer', volunteerRoutes);


export default router;
