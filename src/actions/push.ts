'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function registerPushToken(token: string, platform: 'ios' | 'android' | 'web') {
  const auth = await requireAuth();
  const supabase = createClient();

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      {
        user_id: auth.userId,
        token,
        platform,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' }
    );

  if (error) return { error: error.message };
  return { success: true };
}

export async function deregisterPushToken(token: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', auth.userId)
    .eq('token', token);

  return { success: true };
}
