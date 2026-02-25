import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
// Bypasses RLS - all authorization is handled at the application level
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
