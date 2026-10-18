import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey: string = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Validates whether Supabase environment variables are properly configured
 * and not set to placeholder values.
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here') &&
  !supabaseAnonKey.includes('your-anon-key')
);

/**
 * Resilient Supabase client instance.
 * Gracefully defaults to null when credentials are missing or invalid,
 * enabling seamless local offline fallback.
 */
let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.warn('[SupabaseClient] Initialization failed; engaging offline fallback engine:', error);
    clientInstance = null;
  }
}

export const supabase: SupabaseClient | null = clientInstance;

/**
 * Connectivity probe to detect whether the Supabase BaaS is actively reachable.
 * Returns true if the session check succeeds, false on network or auth error.
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) {
    return false;
  }
  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch (err) {
    console.warn('[SupabaseClient] Connectivity probe failed:', err);
    return false;
  }
};
