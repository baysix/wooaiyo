import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Browser-side Supabase client (read-only public data)
// For writes, use server actions instead
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
