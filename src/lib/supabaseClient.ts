import { createClient } from '@supabase/supabase-js';

const isTestMode = import.meta.env.MODE === 'test';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || (isTestMode ? 'https://example.supabase.co' : '');
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (isTestMode ? 'test-anon-key' : '');

if (!isTestMode && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (for example, in .env).',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
