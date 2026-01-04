import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import financeRoutes from './finance.routes';
import authRoutes from './auth.routes';
import volunteerProjectRoutes from './volunteer-project.routes';
import donationRoutes from './donation.routes';
import donationProjectRoutes from './donation-project.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint
router.get('/health', getHealth);

// Auth routes
router.use('/auth', authRoutes);

// Finance routes (admin operations)
router.use('/finance', financeRoutes);

// Donation domain routes
router.use('/donation-projects', donationProjectRoutes); // Project management
router.use('/donations', donationRoutes); // Transactions & browsing

// Volunteer domain routes
router.use('/volunteer-projects', volunteerProjectRoutes); // Project management

export default router;
