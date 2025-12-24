import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import { submitVolunteerApplication, getVolunteerApplications, getAvailableVolunteerActivities } from '../controllers/volunteerController';

import financeRoutes from './finance.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);
router.post('/api/volunteer/application', submitVolunteerApplication);
router.get('/api/volunteer/application/:userId', getVolunteerApplications);
// for filtering can use api as http://localhost:3000/api/volunteer/availableActivities?page=1&limit=5&search=community
router.get('/api/volunteer/availableActivities', getAvailableVolunteerActivities);




router.use('/finance', financeRoutes);

export default router;
