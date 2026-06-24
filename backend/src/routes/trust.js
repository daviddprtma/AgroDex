import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { calculateProducerTrustScore } from '../services/trust-score.service.js';
import { supabase } from '../db.js';

const router = express.Router();

// Apply rate limiting
router.use(generalLimiter);

/**
 * GET /api/trust/producer/:farmerId
 * 
 * Retrieve a producer's dynamic trust score, analytics, badge status,
 * certification history, and compliance summary.
 */
router.get('/producer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(farmerId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid farmerId format. Must be a valid UUID.',
      });
    }

    const trustData = await calculateProducerTrustScore(farmerId);

    return res.json({
      ok: true,
      data: trustData,
    });
  } catch (err) {
    console.error('[trust] GET /producer/:farmerId error:', err.message);
    return res.status(500).json({
      ok: false,
      error: 'Failed to retrieve producer trust score details',
      details: err.message,
    });
  }
});

/**
 * POST /api/trust/producer/:farmerId/certifications
 * 
 * Add a new certification for a producer. Only the producer themselves
 * can add certifications to their profile.
 */
router.post('/producer/:farmerId/certifications', requireAuth, async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { name, issue_date, expiry_date } = req.body;

    // Validate user is modifying their own profile
    if (req.user.id !== farmerId) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden: You can only add certifications to your own profile.',
      });
    }

    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: 'Certification name is required.' });
    }
    if (!issue_date || isNaN(Date.parse(issue_date))) {
      return res.status(400).json({ ok: false, error: 'Valid issue date is required.' });
    }
    if (!expiry_date || isNaN(Date.parse(expiry_date))) {
      return res.status(400).json({ ok: false, error: 'Valid expiry date is required.' });
    }

    const issueDateObj = new Date(issue_date);
    const expiryDateObj = new Date(expiry_date);

    if (expiryDateObj < issueDateObj) {
      return res.status(400).json({
        ok: false,
        error: 'Expiry date cannot be before issue date.',
      });
    }

    // Determine derived status
    const status = expiryDateObj < new Date() ? 'Expired' : 'Active';

    // Insert into Supabase
    const { data, error } = await supabase
      .from('producer_certifications')
      .insert([{
        farmer_id: farmerId,
        name: name.trim(),
        issue_date,
        expiry_date,
        status
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error('[trust] POST /producer/:farmerId/certifications error:', err.message);
    return res.status(500).json({
      ok: false,
      error: 'Failed to add producer certification',
      details: err.message,
    });
  }
});

/**
 * DELETE /api/trust/producer/:farmerId/certifications/:certId
 * 
 * Delete a certification. Only the owner of the certification
 * can delete it.
 */
router.delete('/producer/:farmerId/certifications/:certId', requireAuth, async (req, res) => {
  try {
    const { farmerId, certId } = req.params;

    // Validate user is modifying their own profile
    if (req.user.id !== farmerId) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden: You can only manage certifications on your own profile.',
      });
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('producer_certifications')
      .delete()
      .eq('id', certId)
      .eq('farmer_id', farmerId);

    if (error) {
      throw error;
    }

    return res.json({
      ok: true,
      message: 'Certification deleted successfully.',
    });
  } catch (err) {
    console.error('[trust] DELETE /producer/:farmerId/certifications/:certId error:', err.message);
    return res.status(500).json({
      ok: false,
      error: 'Failed to delete producer certification',
      details: err.message,
    });
  }
});

export default router;
