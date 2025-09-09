import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);

export default router;