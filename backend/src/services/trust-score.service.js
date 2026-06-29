import { supabase } from '../db.js';

// Configurable scoring parameters
export const TRUST_CONFIG = {
  // Threshold score to get the Trusted Producer Badge
  TRUST_THRESHOLD: parseInt(process.env.TRUST_SCORE_THRESHOLD || '80', 10),
  
  // Starting score for a brand-new producer with no history
  DEFAULT_NEW_PRODUCER_SCORE: 70,

  // Max score contribution points for each category
  WEIGHTS: {
    vsr: 30,          // Max points for Verification Success Rate
    successCount: 20, // Max points for volume of successful verifications
    certifications: 30, // Max points for certifications
    compliance: 20,   // Max points for low-risk fraud reports
  },

  // Verification rates
  VSR_NEUTRAL_FALLBACK: 20, // Points given when there are no verifications but other history exists

  // Certifications
  POINTS_PER_ACTIVE_CERT: 15,
  PENALTY_PER_EXPIRED_CERT: 5,
  MAX_CERT_PENALTY: 10,

  // Compliance (fraud risk)
  COMPLIANCE_NEUTRAL_FALLBACK: 15, // Points given when there are no batches/fraud scores
};

/**
 * Calculates a producer's trust score (0–100) dynamically.
 * 
 * @param {string} farmerId - UUID of the farmer/producer
 * @returns {Promise<Object>} Calculated score metrics, analytics, and badge status
 */
export async function calculateProducerTrustScore(farmerId) {
  if (!farmerId) {
    throw new Error('farmerId is required');
  }

  // 1. Fetch certifications
  const { data: certs, error: certsError } = await supabase
    .from('producer_certifications')
    .select('*')
    .eq('farmer_id', farmerId);

  if (certsError) throw certsError;

  // Process certifications
  const now = new Date();
  const processedCerts = (certs || []).map(cert => {
    const isExpired = new Date(cert.expiry_date) < now;
    const derivedStatus = isExpired ? 'Expired' : 'Active';
    return {
      ...cert,
      status: derivedStatus
    };
  });

  const activeCerts = processedCerts.filter(c => c.status === 'Active');
  const expiredCerts = processedCerts.filter(c => c.status === 'Expired');

  // 2. Fetch batches to link to verifications & fraud scores
  const { data: batches, error: batchesError } = await supabase
    .from('batches')
    .select('id, hedera_token_id, hedera_serial_number')
    .eq('farmer_id', farmerId);

  if (batchesError) throw batchesError;

  const totalBatches = batches?.length || 0;
  const tokenizedBatches = (batches || []).filter(b => b.hedera_token_id && b.hedera_serial_number);

  // 3. Fetch verifications matching farmer's tokenized batches
  let verifications = [];
  if (tokenizedBatches.length > 0) {
    const tokenIds = [...new Set(tokenizedBatches.map(b => b.hedera_token_id))];
    const { data: verifData, error: verifError } = await supabase
      .from('verifications')
      .select('*')
      .in('token_id', tokenIds);

    if (verifError) throw verifError;

    // Filter in-memory to match exact token_id + serial_number pairs
    verifications = (verifData || []).filter(v =>
      tokenizedBatches.some(b => b.hedera_token_id === v.token_id && String(b.hedera_serial_number) === String(v.serial_number))
    );
  }

  // Calculate Verification Analytics
  const totalVerifications = verifications.length;
  let successfulVerifications = 0;
  let failedVerifications = 0;

  verifications.forEach(v => {
    // Check if trace has AI and trustScore >= 80
    const trustScore = v.trace?.ai?.trustScore;
    if (trustScore !== undefined && trustScore !== null) {
      if (Number(trustScore) >= 80) {
        successfulVerifications++;
      } else {
        failedVerifications++;
      }
    } else {
      // Default to successful if no AI assessment exists yet
      successfulVerifications++;
    }
  });

  const successRate = totalVerifications > 0
    ? Math.round((successfulVerifications / totalVerifications) * 100)
    : 0;

  // 4. Fetch compliance / fraud scores
  const { data: fraudScores, error: fraudError } = await supabase
    .from('fraud_scores')
    .select('risk_score')
    .eq('farmer_id', farmerId);

  if (fraudError) throw fraudError;

  const totalFraudScores = fraudScores?.length || 0;
  let averageRiskScore = 0;
  if (totalFraudScores > 0) {
    const sum = fraudScores.reduce((acc, row) => acc + row.risk_score, 0);
    averageRiskScore = Math.round(sum / totalFraudScores);
  }

  // --- SCORING CALCULATION ---
  const hasHistory = totalVerifications > 0 || processedCerts.length > 0 || totalBatches > 0;
  
  let trustScore = TRUST_CONFIG.DEFAULT_NEW_PRODUCER_SCORE;

  let vsrContribution = 0;
  let successCountContribution = 0;
  let certsContribution = 0;
  let complianceContribution = 0;

  if (hasHistory) {
    // A. Verification Success Rate Contribution (Max VSR_WEIGHT)
    if (totalVerifications > 0) {
      vsrContribution = (successRate / 100) * TRUST_CONFIG.WEIGHTS.vsr;
    } else {
      vsrContribution = TRUST_CONFIG.VSR_NEUTRAL_FALLBACK;
    }

    // B. Number of Successful Verifications (Max successCount weight)
    // Reward up to 7 successful verifications (each +3 pts up to 20 pts max)
    successCountContribution = Math.min(successfulVerifications * 3, TRUST_CONFIG.WEIGHTS.successCount);

    // C. Certifications Contribution
    const positiveCertPoints = activeCerts.length * TRUST_CONFIG.POINTS_PER_ACTIVE_CERT;
    const negativeCertPoints = expiredCerts.length * TRUST_CONFIG.PENALTY_PER_EXPIRED_CERT;
    const netCertPoints = positiveCertPoints - Math.min(negativeCertPoints, TRUST_CONFIG.MAX_CERT_PENALTY);
    certsContribution = Math.max(-10, Math.min(netCertPoints, TRUST_CONFIG.WEIGHTS.certifications));

    // D. Compliance Consistency Contribution
    if (totalFraudScores > 0) {
      const complianceScore = 100 - averageRiskScore;
      complianceContribution = (complianceScore / 100) * TRUST_CONFIG.WEIGHTS.compliance;
    } else {
      complianceContribution = TRUST_CONFIG.COMPLIANCE_NEUTRAL_FALLBACK;
    }

    // Grand total clamped
    trustScore = Math.round(vsrContribution + successCountContribution + certsContribution + complianceContribution);
    trustScore = Math.max(0, Math.min(trustScore, 100));
  }

  const hasTrustedBadge = trustScore >= TRUST_CONFIG.TRUST_THRESHOLD;

  // Determine compliance text representation
  let complianceLevel = 'N/A';
  if (totalFraudScores > 0) {
    if (averageRiskScore < 20) complianceLevel = 'Excellent (Perfect Compliance)';
    else if (averageRiskScore < 35) complianceLevel = 'Good';
    else if (averageRiskScore < 55) complianceLevel = 'Moderate';
    else complianceLevel = 'Needs Attention';
  } else if (totalBatches > 0) {
    complianceLevel = 'Good (No Risk Signals Detected)';
  } else {
    complianceLevel = 'New Producer (No Batch History)';
  }

  return {
    trustScore,
    hasTrustedBadge,
    trustedThreshold: TRUST_CONFIG.TRUST_THRESHOLD,
    verificationAnalytics: {
      totalVerifications,
      successfulVerifications,
      failedVerifications,
      successRate
    },
    certificationHistory: processedCerts,
    complianceSummary: {
      averageRiskScore,
      totalBatches,
      safeBatchesCount: totalBatches - totalFraudScores, // simple proxy: count batches without critical fraud entries
      complianceLevel
    }
  };
}
