import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let isInitialized = false;
let initializationError: string | null = null;

export function initializeSupabase(): { client: SupabaseClient | null; error: string | null } {
  if (isInitialized) {
    return { client: supabase, error: initializationError };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    initializationError = 'Supabase configuration is missing. Please check your environment variables.';
    isInitialized = true;
    return { client: null, error: initializationError };
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isInitialized = true;
    return { client: supabase, error: null };
  } catch (error) {
    initializationError = error instanceof Error ? error.message : 'Failed to initialize Supabase client';
    isInitialized = true;
    return { client: null, error: initializationError };
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isInitialized) {
    initializeSupabase();
  }
  return supabase;
}

export function getSupabaseError(): string | null {
  return initializationError;
}

// Initialize on module load
initializeSupabase();

