import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';
import { matchVolunteerToProject } from '../controllers/projectController';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);

router.use('/finance', financeRoutes);

// Project routes
router.post('/projects/match', matchVolunteerToProject);

export default router;
