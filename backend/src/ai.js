import axios from 'axios';
import { env } from './utils/config.js';

const GEMINI_MODEL_RAW = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
// Normalize by stripping leading 'models/' if present
const normalizedModel = GEMINI_MODEL_RAW.replace(/^models\//, '');
// Validate model name to prevent unexpected characters in URL path
const GEMINI_MODEL = /^[A-Za-z0-9._-]+$/.test(normalizedModel) ? normalizedModel : 'gemini-3.1-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;

/**
 * Analyze batch data using Gemini AI for validation and enrichment
 * @param {Object} batchInfo - Batch information
 * @param {string} batchInfo.batchName - Name of the batch
 * @param {string} batchInfo.location - Location of the batch
 * @param {string} batchInfo.photoUrl - URL of the batch photo
 * @returns {Promise<Object>} AI analysis results
 */
export async function analyzeBatch({ batchName, location, photoUrl }) {
  try {
    const prompt = `Analyze this agricultural batch for quality and authenticity:
    
Batch Name: ${batchName}
Location: ${location}
Photo URL: ${photoUrl}

Provide a brief analysis covering:
1. Batch name validity (does it follow standard naming conventions?)
2. Location verification (is it a valid agricultural region?)
3. Potential quality indicators
4. Any red flags or concerns

Keep the response concise and structured.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const analysisText = response.data.candidates[0]?.content?.parts[0]?.text || 'No analysis available';

    console.log('✅ AI analysis completed');

    return {
      analysis: analysisText,
      confidence: 'medium',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ AI analysis failed:', error.message);
    
    // Return fallback analysis instead of throwing
    return {
      analysis: 'AI analysis unavailable - batch registered without AI validation',
      confidence: 'none',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}
