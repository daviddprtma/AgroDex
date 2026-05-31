/**
 * AI Routes - Gemini-powered endpoints for image analysis, provenance, Q&A, etc.
 */

import express from 'express';
import { analyzeImageController, buyerQAController, priceSuggestionController, summarizeProvenanceController, translateMarketingController } from '../controllers/ai.controller.js';

const router = express.Router();

/**
 * POST /api/ai/analyze-image
 * Analyze agricultural product image
 */
router.post('/analyze-image', analyzeImageController);

/**
 * POST /api/ai/summarize-provenance
 * Generate provenance summary from HCS timeline
 */
router.post('/summarize-provenance', summarizeProvenanceController);

/**
 * POST /api/ai/buyer-qa
 * Answer buyer questions about product provenance
 */
router.post('/buyer-qa', buyerQAController);

/**
 * POST /api/ai/translate-marketing
 * Translate and generate marketing content
 */
router.post('/translate-marketing', translateMarketingController);

/**
 * POST /api/ai/price-suggestion
 * Suggest price uplift based on quality and traceability
 */
router.post('/price-suggestion', priceSuggestionController);

export default router;
