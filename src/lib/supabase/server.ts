import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
// Bypasses RLS - all authorization is handled at the application level
let client: SupabaseClient | null = null;

export function createClient() {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return client;
}
