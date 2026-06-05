import { Router } from 'express';
import { databaseHealthController, fullSystemHealthController, pingHealthController } from '../controllers/health.controller.js';

const router = Router();

/**
 * Simple ping endpoint for quick health checks
 * Returns immediately without external dependencies
 */
router.get('/health/ping',pingHealthController);

/**
 * Database health check endpoint with comprehensive diagnostics
 * Tests connection to Supabase and verifies batches table exists
 */
router.get('/health/db', databaseHealthController);

/**
 * Full system health check
 * Tests Supabase Auth, REST API, Hedera Mirror Node, and Gemini AI
 */
router.get('/health/full',fullSystemHealthController);

export default router;
