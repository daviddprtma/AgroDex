import { TopicMessageSubmitTransaction, TopicId, Hbar } from '@hashgraph/sdk';
import { getHederaClient } from './hederaClient.js';
import { env } from './utils/config.js';

/**
 * Submit batch data to Hedera Consensus Service (HCS)
 * Enforces a minimal max transaction fee cap for Mainnet safety.
 * @param {Object} batchData - Batch data to submit (will be JSON stringified)
 * @returns {Promise<{transactionId: string, receipt: Object}>}
 */
export async function submitBatchData(batchData) {
  try {
    const client = getHederaClient();
    const topicId = TopicId.fromString(env.HEDERA_TOPIC_ID);

    // Convert batch data to JSON string
    const message = JSON.stringify({
      ...batchData,
      timestamp: new Date().toISOString()
    });

    // Submit message to HCS topic
    const transaction = new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: message
    })
    // Cap transaction fees to a minimal safety amount (e.g., max 1 HBAR for an HCS message submit)
    // Ensures predictable spending profiles on Mainnet
    .setMaxTransactionFee(new Hbar(1)); 

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ HCS message submitted - Transaction ID: ${txResponse.transactionId.toString()}`);

    return {
      transactionId: txResponse.transactionId.toString(),
      receipt: {
        status: receipt.status.toString(),
        topicSequenceNumber: receipt.topicSequenceNumber?.toString()
      }
    };
  } catch (error) {
    console.error('❌ HCS submission failed:', error.message);
    throw new Error(`Failed to submit to HCS: ${error.message}`);
  }
}

/**
 * Scalable Batch Registration processing.
 * Breaks down massive data packages into manageable chunks to optimize throughput, 
 * stay within Hedera max transaction limits, and conserve network gas/fees.
 * @param {Array} dynamicItemsArray - Full payload list needing ledger registration
 * @returns {Promise<Array>} List of successful transaction outputs
 */
export async function submitScaledBatchRegistrations(dynamicItemsArray) {
  if (!Array.isArray(dynamicItemsArray)) {
    throw new Error("Input must be an array of batch registration items.");
  }

  const CHUNK_SIZE = 5; // Optimal scaled constraint for message size limits
  const results = [];

  console.log(`🚀 Scaling execution: Processing ${dynamicItemsArray.length} items in chunks of ${CHUNK_SIZE}...`);

  for (let i = 0; i < dynamicItemsArray.length; i += CHUNK_SIZE) {
    const chunk = dynamicItemsArray.slice(i, i + CHUNK_SIZE);
    
    const structuredPayload = {
      batchChunkIndex: Math.floor(i / CHUNK_SIZE) + 1,
      items: chunk
    };

    // Submits the safely partitioned chunk natively
    const outcome = await submitBatchData(structuredPayload);
    results.push(outcome);
  }

  return results;
}

/**
 * Fetch HCS message from Mirror Node
 * @param {string} topicId - Topic ID
 * @param {string} sequenceNumber - Message sequence number
 * @returns {Promise<Object>} Message data
 */
export async function fetchHCSMessage(topicId, sequenceNumber) {
  try {
    const axios = (await import('axios')).default;
    const url = `${env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com'}/api/v1/topics/${topicId}/messages/${sequenceNumber}`;
    
    const response = await axios.get(url);
    
    // Decode base64 message
    const messageBuffer = Buffer.from(response.data.message, 'base64');
    const messageData = JSON.parse(messageBuffer.toString('utf-8'));
    
    return {
      ...messageData,
      consensusTimestamp: response.data.consensus_timestamp,
      sequenceNumber: response.data.sequence_number
    };
  } catch (error) {
    console.error('❌ Failed to fetch HCS message:', error.message);
    throw new Error(`Failed to fetch HCS message: ${error.message}`);
  }
}
