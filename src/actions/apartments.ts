'use server';

import { createClient } from '@/lib/supabase/server';

export async function getActiveApartments() {
  const supabase = createClient();
  const { data } = await supabase
    .from('apartments')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return data ?? [];
}
