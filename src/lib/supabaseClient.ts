import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = (val: string | undefined) => {
  return !val || val === 'your_supabase_anon_key' || val.includes('placeholder') || val === '';
};

const createMockSupabase = () => {
  console.warn("Using mock Supabase client because Supabase URL or Anon Key is missing or placeholder.");
  
  const mockDbBuilder: any = {
    select: () => mockDbBuilder,
    insert: () => mockDbBuilder,
    update: () => mockDbBuilder,
    delete: () => mockDbBuilder,
    eq: () => mockDbBuilder,
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
    then: (resolve: any) => {
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
      getSession: async () => ({
        data: {
          session: {
            access_token: "mock-access-token-for-local-dev",
            user: {
              id: "mock-user-uuid-1234-5678",
              email: "producer@agrodex.com",
              user_metadata: {
                address: "0x1234567890123456789012345678901234567890"
              }
            },
            expires_at: 9999999999
          }
        },
        error: null
      }),
      onAuthStateChange: (callback: any) => {
        setTimeout(() => {
          callback("SIGNED_IN", {
            user: {
              id: "mock-user-uuid-1234-5678",
              email: "producer@agrodex.com",
              user_metadata: {
                address: "0x1234567890123456789012345678901234567890"
              }
            },
            expires_at: 9999999999
          });
        }, 50);
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      },
      signOut: async () => ({ error: null }),
      signUp: async ({ email }: any) => ({
        data: {
          user: {
            id: "mock-user-uuid-1234-5678",
            email: email || "producer@agrodex.com"
          }
        },
        error: null
      }),
      signInWithPassword: async ({ email }: any) => ({
        data: {
          user: {
            id: "mock-user-uuid-1234-5678",
            email: email || "producer@agrodex.com"
          }
        },
        error: null
      }),
      signInWithWeb3: async () => ({
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
      refreshSession: async () => ({
        data: {
          session: {
            user: {
              id: "mock-user-uuid-1234-5678",
              email: "producer@agrodex.com"
            }
          }
        },
        error: null
      })
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    from: (table: string) => {
      return mockDbBuilder;
    },
    functions: {
      invoke: async (name: string) => {
        if (name.startsWith('audit-logs')) {
          return {
            data: {
              ok: true,
              data: [
                { token_id: "0.0.100001", serial_number: "1", score: 92, trustExplanation: "High quality organic batch", rationale: "Passed all checks", verified_at: new Date().toISOString(), status: "approved" },
                { token_id: "0.0.100002", serial_number: "1", score: 88, trustExplanation: "Fair trade certified", rationale: "Passed all checks", verified_at: new Date().toISOString(), status: "approved" },
                { token_id: "0.0.100003", serial_number: "1", score: 45, trustExplanation: null, rationale: "Inconsistent harvest dates", verified_at: new Date().toISOString(), status: "flagged" },
              ],
              pagination: { totalRecords: 3, totalPages: 1, currentPage: 1, limit: 10 }
            },
            error: null
          };
        }
        if (name === 'health') {
          return { data: { ok: true, services: { hedera: { ok: true }, ai: { ok: true } } }, error: null };
        }
        return { data: { success: true, message: `Mock invoked ${name}` }, error: null };
      }
    }
  } as unknown as ReturnType<typeof createClient>;
};

export const supabase = (
  supabaseUrl && !isPlaceholder(supabaseUrl) && supabaseAnonKey && !isPlaceholder(supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockSupabase()
);



