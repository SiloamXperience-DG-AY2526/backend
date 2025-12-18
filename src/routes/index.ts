import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import { submitVolunteerApplication } from '../controllers/volunteerController';


const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);
router.post('/volunteer/application', submitVolunteerApplication);

export default router;