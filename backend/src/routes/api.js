import express from "express";
import { requireAuth } from "../middleware/auth.js";

import { getDashboardHealthController, getDashboardStatsController, healthCheckController, registerBatchController, tokenizeBatchController, verifyBatchController } from "../controllers/api.controller.js";

const router = express.Router();

/**
 * GET /api/dashboard-stats
 * Get dashboard statistics (batches, NFTs, verifications, audit, AI insight)
 * Protected: Requires authentication
 */
router.get("/dashboard-stats", requireAuth, getDashboardStatsController);

/**
 * GET /api/dashboard-health
 * Check health status of all services (Supabase, Hedera, Gemini) in parallel
 * Protected: Requires authentication
 */
router.get("/dashboard-health", requireAuth,getDashboardHealthController);

/**
 * POST /api/register-batch
 * Register a new agricultural batch with AI analysis and HCS submission
 * Protected: Requires authentication
 */
router.post("/register-batch", requireAuth, registerBatchController);

/**
 * POST /api/tokenize-batch
 * Create NFT token for batch(es) with HCS transaction IDs
 * Protected: Requires authentication
 */
router.post("/tokenize-batch", requireAuth, tokenizeBatchController);

/**
 * GET /api/verify-batch/:tokenId/:serialNumber
 * Verify batch authenticity by fetching NFT metadata and HCS messages
 */
router.get("/verify-batch/:tokenId/:serialNumber",verifyBatchController);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/health",healthCheckController);

export default router;
