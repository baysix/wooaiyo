'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

const MAX_KEYWORDS = 10;

export async function getMyKeywords() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data } = await supabase
    .from('keyword_alerts')
    .select('*')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function addKeyword(keyword: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const trimmed = keyword.trim();
  if (!trimmed) return { error: '키워드를 입력해주세요' };
  if (trimmed.length < 2) return { error: '2글자 이상 입력해주세요' };
  if (trimmed.length > 20) return { error: '20글자 이하로 입력해주세요' };

  // Check count
  const { count } = await supabase
    .from('keyword_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.userId);

  if ((count ?? 0) >= MAX_KEYWORDS) {
    return { error: `키워드는 최대 ${MAX_KEYWORDS}개까지 등록할 수 있어요` };
  }

  const { error } = await supabase
    .from('keyword_alerts')
    .insert({ user_id: auth.userId, keyword: trimmed });

  if (error) {
    if (error.code === '23505') return { error: '이미 등록된 키워드예요' };
    return { error: error.message };
  }

  return { success: true };
}

export async function removeKeyword(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { error } = await supabase
    .from('keyword_alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleKeyword(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('keyword_alerts')
    .select('is_active')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();

  if (!existing) return { error: '키워드를 찾을 수 없습니다' };

  const { error } = await supabase
    .from('keyword_alerts')
    .update({ is_active: !existing.is_active })
    .eq('id', id)
    .eq('user_id', auth.userId);

  if (error) return { error: error.message };
  return { success: true, isActive: !existing.is_active };
}
