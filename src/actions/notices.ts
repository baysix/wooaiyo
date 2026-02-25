'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import type { UserRole } from '@/types/database';

async function getProfileWithRole(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, apartment_id, role')
    .eq('id', userId)
    .single();
  return data as { id: string; apartment_id: string | null; role: UserRole } | null;
}

function canManageNotices(role: UserRole) {
  return role === 'admin' || role === 'manager';
}

export async function getNotices() {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfileWithRole(auth.userId);
  if (!profile?.apartment_id) return { notices: [], role: 'resident' as UserRole };

  const { data } = await supabase
    .from('notices')
    .select('*, author:profiles!author_id(id, nickname, avatar_url, role)')
    .eq('apartment_id', profile.apartment_id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  return { notices: data ?? [], role: profile.role };
}

export async function getNotice(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfileWithRole(auth.userId);

  const { data } = await supabase
    .from('notices')
    .select('*, author:profiles!author_id(id, nickname, avatar_url, role)')
    .eq('id', id)
    .single();

  if (!data || data.apartment_id !== profile?.apartment_id) {
    return { notice: null, role: 'resident' as UserRole };
  }

  // Increment view count
  await supabase
    .from('notices')
    .update({ view_count: data.view_count + 1 })
    .eq('id', id);

  return { notice: data, role: profile?.role ?? 'resident' as UserRole };
}

export async function createNotice(formData: FormData) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfileWithRole(auth.userId);
  if (!profile?.apartment_id || !canManageNotices(profile.role)) {
    return { error: '권한이 없습니다' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title?.trim() || !content?.trim()) {
    return { error: '제목과 내용을 입력해주세요' };
  }

  const { data, error } = await supabase
    .from('notices')
    .insert({
      apartment_id: profile.apartment_id,
      author_id: auth.userId,
      title: title.trim(),
      content: content.trim(),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true, id: data.id };
}

export async function updateNotice(id: string, formData: FormData) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfileWithRole(auth.userId);
  if (!profile) return { error: '권한이 없습니다' };

  const { data: notice } = await supabase
    .from('notices')
    .select('author_id, apartment_id')
    .eq('id', id)
    .single();

  if (!notice || notice.apartment_id !== profile.apartment_id) {
    return { error: '공지사항을 찾을 수 없습니다' };
  }

  if (notice.author_id !== auth.userId && profile.role !== 'admin') {
    return { error: '권한이 없습니다' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title?.trim() || !content?.trim()) {
    return { error: '제목과 내용을 입력해주세요' };
  }

  const { error } = await supabase
    .from('notices')
    .update({
      title: title.trim(),
      content: content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true };
}

export async function deleteNotice(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfileWithRole(auth.userId);
  if (!profile) return { error: '권한이 없습니다' };

  const { data: notice } = await supabase
    .from('notices')
    .select('author_id, apartment_id')
    .eq('id', id)
    .single();

  if (!notice || notice.apartment_id !== profile.apartment_id) {
    return { error: '공지사항을 찾을 수 없습니다' };
  }

  if (notice.author_id !== auth.userId && profile.role !== 'admin') {
    return { error: '권한이 없습니다' };
  }

  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true };
}

export async function toggleNoticePin(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfileWithRole(auth.userId);
  if (!profile) return { error: '권한이 없습니다' };

  const { data: notice } = await supabase
    .from('notices')
    .select('author_id, apartment_id, is_pinned')
    .eq('id', id)
    .single();

  if (!notice || notice.apartment_id !== profile.apartment_id) {
    return { error: '공지사항을 찾을 수 없습니다' };
  }

  if (notice.author_id !== auth.userId && profile.role !== 'admin') {
    return { error: '권한이 없습니다' };
  }

  const { error } = await supabase
    .from('notices')
    .update({ is_pinned: !notice.is_pinned })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true, is_pinned: !notice.is_pinned };
}
