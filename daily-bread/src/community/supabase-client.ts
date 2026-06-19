import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Storage from 'expo-sqlite/kv-store';

/**
 * Supabase wiring. The app goes "live" the moment these two env vars
 * exist (in .env, see .env.example) — otherwise the community features
 * run on the offline preview repository.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig(): boolean {
  return typeof url === 'string' && url.length > 0 && typeof anonKey === 'string' && anonKey.length > 0;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client === null) {
    if (!hasSupabaseConfig()) {
      throw new Error('Supabase config missing — check EXPO_PUBLIC_SUPABASE_URL/ANON_KEY');
    }
    client = createClient(url as string, anonKey as string, {
      auth: {
        // Single storage engine app-wide: expo-sqlite/kv-store. Failures
        // (web OPFS locks) degrade to a session-only auth state instead
        // of crashing the worker channel up the stack.
        storage: {
          getItem: (key: string) => Storage.getItem(key).catch(() => null),
          setItem: (key: string, value: string) => Storage.setItem(key, value).catch(() => {}),
          removeItem: (key: string) => Storage.removeItem(key).catch(() => {}),
        },
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
