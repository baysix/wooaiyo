'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuthWithRole, isAdmin, isManager } from '@/lib/auth';

export async function getNotices() {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  if (!auth.apartmentId && !isAdmin(auth.role)) {
    return { notices: [], role: auth.role };
  }

  let query = supabase
    .from('notices')
    .select('*, author:profiles!author_id(id, nickname, avatar_url, role)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  // Admin can see all notices; others only see their apartment's
  if (!isAdmin(auth.role)) {
    query = query.eq('apartment_id', auth.apartmentId!);
  }

  const { data } = await query;
  return { notices: data ?? [], role: auth.role };
}

export async function getNotice(id: string) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  const { data } = await supabase
    .from('notices')
    .select('*, author:profiles!author_id(id, nickname, avatar_url, role)')
    .eq('id', id)
    .single();

  // Admin can view any notice; others only their apartment's
  if (!data || (!isAdmin(auth.role) && data.apartment_id !== auth.apartmentId)) {
    return { notice: null, role: auth.role };
  }

  // Increment view count
  await supabase
    .from('notices')
    .update({ view_count: data.view_count + 1 })
    .eq('id', id);

  return { notice: data, role: auth.role };
}

export async function uploadNoticeImage(file: FormData) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  const imageFile = file.get('file') as File;
  if (!imageFile) return { error: 'No file provided' };

  const fileName = `notices/${auth.userId}/${Date.now()}_${imageFile.name}`;
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, imageFile);

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

export async function createNotice(formData: FormData, imageUrls: string[] = []) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  if (!isManager(auth.role)) {
    return { error: '권한이 없습니다' };
  }

  // Admin can specify target apartment; manager uses own apartment
  const targetApartmentId = isAdmin(auth.role)
    ? (formData.get('apartment_id') as string) || auth.apartmentId
    : auth.apartmentId;

  if (!targetApartmentId) {
    return { error: '아파트를 선택해주세요' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title?.trim() || !content?.trim()) {
    return { error: '제목과 내용을 입력해주세요' };
  }

  const { data, error } = await supabase
    .from('notices')
    .insert({
      apartment_id: targetApartmentId,
      author_id: auth.userId,
      title: title.trim(),
      content: content.trim(),
      images: imageUrls,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true, id: data.id };
}

export async function updateNotice(id: string, formData: FormData, imageUrls: string[] = []) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  if (!isManager(auth.role)) {
    return { error: '권한이 없습니다' };
  }

  const { data: notice } = await supabase
    .from('notices')
    .select('author_id, apartment_id')
    .eq('id', id)
    .single();

  if (!notice) {
    return { error: '공지사항을 찾을 수 없습니다' };
  }

  // Admin can edit any notice; manager only their apartment's own notices
  if (!isAdmin(auth.role)) {
    if (notice.apartment_id !== auth.apartmentId) {
      return { error: '공지사항을 찾을 수 없습니다' };
    }
    if (notice.author_id !== auth.userId) {
      return { error: '권한이 없습니다' };
    }
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
      images: imageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true };
}

export async function deleteNotice(id: string) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  if (!isManager(auth.role)) {
    return { error: '권한이 없습니다' };
  }

  const { data: notice } = await supabase
    .from('notices')
    .select('author_id, apartment_id')
    .eq('id', id)
    .single();

  if (!notice) {
    return { error: '공지사항을 찾을 수 없습니다' };
  }

  // Admin can delete any; manager only their apartment's own
  if (!isAdmin(auth.role)) {
    if (notice.apartment_id !== auth.apartmentId) {
      return { error: '공지사항을 찾을 수 없습니다' };
    }
    if (notice.author_id !== auth.userId) {
      return { error: '권한이 없습니다' };
    }
  }

  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true };
}

export async function toggleNoticePin(id: string) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  if (!isManager(auth.role)) {
    return { error: '권한이 없습니다' };
  }

  const { data: notice } = await supabase
    .from('notices')
    .select('author_id, apartment_id, is_pinned')
    .eq('id', id)
    .single();

  if (!notice) {
    return { error: '공지사항을 찾을 수 없습니다' };
  }

  // Admin can pin any; manager only their apartment's own
  if (!isAdmin(auth.role)) {
    if (notice.apartment_id !== auth.apartmentId) {
      return { error: '공지사항을 찾을 수 없습니다' };
    }
    if (notice.author_id !== auth.userId) {
      return { error: '권한이 없습니다' };
    }
  }

  const { error } = await supabase
    .from('notices')
    .update({ is_pinned: !notice.is_pinned })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/community/notices');
  return { success: true, is_pinned: !notice.is_pinned };
}
