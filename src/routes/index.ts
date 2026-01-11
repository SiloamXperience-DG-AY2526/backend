import { Router } from 'express';
import { getRoot, getHealth } from '../controllers/rootController';
import authRoutes from './auth.routes';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import volunteerProjectRoutes from './volunteerProject.routes';
import donationRoutes from './donation.routes';
import profileRoutes from './profile.routes';
import donationProjectRoutes from './donationProject.routes';
import volunteerApplicationRoutes from './volunteerApplication.routes';
import donorRoutes from './donor.routes';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);

// GET /health - Health check endpoint (Public)
router.get('/health', getHealth);

// Auth routes
router.use('/auth', authRoutes);

// Profile routes
router.use('/profile', profileRoutes);

// Apply JWT auth to all routes below
router.use(authenticateJWT);

// Donation domain routes
router.use('/donation-projects', donationProjectRoutes); // Project management
router.use('/donations', donationRoutes); // Transactions & browsing
router.use('/donors', donorRoutes);

// Volunteer domain routes
router.use('/volunteer-projects', volunteerProjectRoutes); // Project management
router.use('/volunteer-applications', volunteerApplicationRoutes); // Project management
export default router;
