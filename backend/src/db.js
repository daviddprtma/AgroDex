import { createClient } from '@supabase/supabase-js';
import { env, isMockMode } from './utils/config.js';

const createMockSupabase = () => {
  console.warn("⚠️ Using Mock Supabase client in backend because Supabase URL or Service Role Key is a placeholder.");
  
  const mockDbBuilder = {
    select: () => mockDbBuilder,
    insert: (data) => {
      const inserted = Array.isArray(data) ? data[0] : data;
      const builder = {
        select: () => ({
          single: async () => ({ id: "mock-inserted-id", ...inserted })
        }),
        then: (resolve) => resolve({ data: [{ id: "mock-inserted-id", ...inserted }], error: null })
      };
      return builder;
    },
    upsert: (data) => {
      const upserted = Array.isArray(data) ? data[0] : data;
      const builder = {
        select: () => ({
          single: async () => ({ id: "mock-upserted-id", ...upserted })
        }),
        then: (resolve) => resolve({ data: [{ id: "mock-upserted-id", ...upserted }], error: null })
      };
      return builder;
    },
    update: (data) => {
      const builder = {
        eq: () => ({
          then: (resolve) => resolve({ data: [data], error: null })
        }),
        then: (resolve) => resolve({ data: [data], error: null })
      };
      return builder;
    },
    delete: () => {
      const builder = {
        eq: () => builder,
        then: (resolve) => resolve({ error: null })
      };
      return builder;
    },
    eq: () => mockDbBuilder,
    not: () => mockDbBuilder,
    gte: () => mockDbBuilder,
    lte: () => mockDbBuilder,
    lt: () => mockDbBuilder,
    order: () => mockDbBuilder,
    limit: () => mockDbBuilder,
    single: async () => ({
      data: {
        id: "mock-user-uuid-1234-5678",
        username: "mock_producer",
        full_name: "Mock Producer",
        hedera_account_id: "0.0.12345",
        auth_method: "hybrid",
        created_at: new Date().toISOString()
      },
      error: null
    }),
    maybeSingle: async () => ({
      data: {
        id: "mock-user-uuid-1234-5678",
        username: "mock_producer",
        full_name: "Mock Producer",
        hedera_account_id: "0.0.12345",
        auth_method: "hybrid",
        created_at: new Date().toISOString()
      },
      error: null
    }),
    then: (resolve) => {
      resolve({
        data: [
          {
            id: "mock-user-uuid-1234-5678",
            username: "mock_producer",
            full_name: "Mock Producer",
            hedera_account_id: "0.0.12345",
            auth_method: "hybrid",
            created_at: new Date().toISOString()
          }
        ],
        error: null
      });
    }
  };

  return {
    auth: {
      getUser: async (token) => ({
        data: {
          user: {
            id: "mock-user-uuid-1234-5678",
            email: "producer@agrodex.com",
            user_metadata: {
              address: "0x1234567890123456789012345678901234567890"
            }
          }
        },
        error: null
      }),
      admin: {
        deleteUser: async (userId) => ({ error: null })
      }
    },
    from: (table) => {
      return mockDbBuilder;
    }
  };
};

// Initialize Supabase client
// Uses mock client if env.isMockMode is true
export const supabase = (
  isMockMode
    ? createMockSupabase()
    : createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
);

/**
 * Insert batch record into database
 * @param {Object} batchData - Batch data to insert
 * @returns {Promise<Object>} Inserted record
 */
export async function insertBatch(batchData) {
  const { data, error } = await supabase
    .from('batches')
    .insert([batchData])
    .select()
    .single();

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }

  return data;
}

/**
 * Insert token record into database
 * @param {Object} tokenData - Token data to insert
 * @returns {Promise<Object>} Inserted record
 */
export async function insertToken(tokenData) {
  const { data, error } = await supabase
    .from('tokens')
    .insert([tokenData])
    .select()
    .single();

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }

  return data;
}

/**
 * Insert or update verification record
 * @param {Object} verificationData - Verification data
 * @returns {Promise<Object>} Inserted/updated record
 */
export async function upsertVerification(verificationData) {
  const { data, error } = await supabase
    .from('verifications')
    .upsert([verificationData], {
      onConflict: 'token_id,serial_number'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database upsert failed: ${error.message}`);
  }

  return data;
}

/**
 * Get verification by token ID and serial number
 * @param {string} tokenId - Token ID
 * @param {string} serialNumber - Serial number
 * @returns {Promise<Object|null>} Verification record or null
 */
export async function getVerification(tokenId, serialNumber) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('token_id', tokenId)
    .eq('serial_number', serialNumber);

  console.log("VERIFICATION ROWS:", data?.length);

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  return data?.[0] || null;
}

/**
 * Get token by token ID and serial number
 * @param {string} tokenId - Token ID
 * @param {string} serialNumber - Serial number
 * @returns {Promise<Object|null>} Token record or null
 */
export async function getToken(tokenId, serialNumber) {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('token_id', tokenId)
    .eq('serial_number', serialNumber);

  console.log("TOKEN ROWS:", data?.length);

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  return data?.[0] || null;
}
