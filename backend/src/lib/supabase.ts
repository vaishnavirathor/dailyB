import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

/**
 * Admin client — uses the service_role key to bypass RLS.
 * Only used server-side (Cloud Run).
 */
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
