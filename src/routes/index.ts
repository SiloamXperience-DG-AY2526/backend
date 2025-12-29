import { Router } from "express";
import { getRoot, getHealth } from "../controllers/rootController";
import financeRoutes from "./finance.routes";
import authRoutes from "./auth.routes";
import onboardingRoutes from "./onboarding.routes";

const router = Router();

// GET / - Root endpoint
router.get("/", getRoot);

// GET /health - Health check endpoint
router.get("/health", getHealth);

// Auth routes
router.use("/auth", authRoutes);
// Onboarding routes
router.use("/onboarding", onboardingRoutes);
router.use("/finance", financeRoutes);

export default router;
