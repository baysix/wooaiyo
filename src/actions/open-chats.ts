'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

async function getProfile(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, apartment_id, nickname')
    .eq('id', userId)
    .single();
  return data;
}

export async function getOpenChats() {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfile(auth.userId);
  if (!profile?.apartment_id) return { chats: [], ratings: {} as Record<string, { avg: number; count: number }> };

  const { data } = await supabase
    .from('open_chats')
    .select('*, creator:profiles!creator_id(id, nickname, avatar_url)')
    .eq('apartment_id', profile.apartment_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  const chats = data ?? [];

  // Fetch ratings for all chats
  const chatIds = chats.map(c => c.id);
  const ratings: Record<string, { avg: number; count: number }> = {};

  if (chatIds.length > 0) {
    const { data: reviews } = await supabase
      .from('open_chat_reviews')
      .select('open_chat_id, rating')
      .in('open_chat_id', chatIds);

    if (reviews) {
      for (const r of reviews) {
        if (!ratings[r.open_chat_id]) ratings[r.open_chat_id] = { avg: 0, count: 0 };
        ratings[r.open_chat_id].count++;
      }
      for (const id of Object.keys(ratings)) {
        const chatReviews = reviews.filter(r => r.open_chat_id === id);
        ratings[id].avg = chatReviews.reduce((sum, r) => sum + r.rating, 0) / chatReviews.length;
      }
    }
  }

  return { chats, ratings };
}

export async function getOpenChat(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfile(auth.userId);

  const { data } = await supabase
    .from('open_chats')
    .select('*, creator:profiles!creator_id(id, nickname, avatar_url)')
    .eq('id', id)
    .single();

  if (!data || data.apartment_id !== profile?.apartment_id) {
    return { openChat: null, isCreator: false };
  }

  // Increment view count
  await supabase
    .from('open_chats')
    .update({ view_count: data.view_count + 1 })
    .eq('id', id);

  return { openChat: data, isCreator: data.creator_id === auth.userId };
}

export async function createOpenChat(formData: FormData, imageUrls: string[]) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfile(auth.userId);
  if (!profile?.apartment_id) {
    return { error: '아파트 설정이 필요합니다' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const chatType = formData.get('chat_type') as string;
  const externalLink = formData.get('external_link') as string;
  const category = formData.get('category') as string;
  const eligibility = formData.get('eligibility') as string;
  const accessCode = formData.get('access_code') as string;

  if (!title?.trim()) {
    return { error: '제목을 입력해주세요' };
  }

  if (chatType === 'public' && !externalLink?.trim()) {
    return { error: '공개 채팅은 외부 링크를 입력해주세요' };
  }

  const { data, error } = await supabase
    .from('open_chats')
    .insert({
      apartment_id: profile.apartment_id,
      creator_id: auth.userId,
      title: title.trim(),
      description: description?.trim() || null,
      chat_type: chatType,
      external_link: externalLink?.trim() || null,
      category: category || '기타',
      eligibility: eligibility?.trim() || null,
      images: imageUrls,
      access_code: chatType === 'private' ? accessCode?.trim() || null : null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/community/open-chats');
  return { success: true, id: data.id };
}

export async function updateOpenChat(id: string, formData: FormData, imageUrls: string[]) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: chat } = await supabase
    .from('open_chats')
    .select('creator_id')
    .eq('id', id)
    .single();

  if (!chat || chat.creator_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const chatType = formData.get('chat_type') as string;
  const externalLink = formData.get('external_link') as string;
  const category = formData.get('category') as string;
  const eligibility = formData.get('eligibility') as string;
  const accessCode = formData.get('access_code') as string;

  if (!title?.trim()) {
    return { error: '제목을 입력해주세요' };
  }

  const { error } = await supabase
    .from('open_chats')
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      chat_type: chatType,
      external_link: externalLink?.trim() || null,
      category: category || '기타',
      eligibility: eligibility?.trim() || null,
      images: imageUrls,
      access_code: chatType === 'private' ? accessCode?.trim() || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/community/open-chats');
  return { success: true };
}

export async function deleteOpenChat(id: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: chat } = await supabase
    .from('open_chats')
    .select('creator_id')
    .eq('id', id)
    .single();

  if (!chat || chat.creator_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  const { error } = await supabase
    .from('open_chats')
    .update({ is_active: false })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/community/open-chats');
  return { success: true };
}

export async function requestOpenChatAccess(openChatId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const profile = await getProfile(auth.userId);

  const { data: chat } = await supabase
    .from('open_chats')
    .select('id, creator_id, title, chat_type, apartment_id')
    .eq('id', openChatId)
    .single();

  if (!chat || chat.apartment_id !== profile?.apartment_id) {
    return { error: '오픈채팅을 찾을 수 없습니다' };
  }

  if (chat.chat_type !== 'private') {
    return { error: '공개 채팅은 참여 요청이 필요 없습니다' };
  }

  if (chat.creator_id === auth.userId) {
    return { error: '본인이 만든 채팅입니다' };
  }

  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('open_chat_id', openChatId)
    .eq('buyer_id', auth.userId)
    .single();

  if (existingRoom) {
    return { success: true, chatRoomId: existingRoom.id };
  }

  const { data: newRoom, error } = await supabase
    .from('chat_rooms')
    .insert({
      open_chat_id: openChatId,
      buyer_id: auth.userId,
      seller_id: chat.creator_id,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  await supabase.from('messages').insert({
    chat_room_id: newRoom.id,
    sender_id: auth.userId,
    content: `${profile?.nickname}님이 "${chat.title}" 오픈채팅 참여를 요청했습니다.`,
    is_system: true,
  });

  revalidatePath('/chat');
  return { success: true, chatRoomId: newRoom.id };
}

// Approve access - creator sends link + access code to chat
export async function approveOpenChatAccess(chatRoomId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Get the chat room with open_chat details
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('id, open_chat_id, seller_id, buyer_id')
    .eq('id', chatRoomId)
    .single();

  if (!room || !room.open_chat_id) {
    return { error: '채팅방을 찾을 수 없습니다' };
  }

  // Only the creator (seller) can approve
  if (room.seller_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  // Get open chat details
  const { data: openChat } = await supabase
    .from('open_chats')
    .select('title, external_link, access_code')
    .eq('id', room.open_chat_id)
    .single();

  if (!openChat) {
    return { error: '오픈채팅 정보를 찾을 수 없습니다' };
  }

  // Build structured approval message (JSON for rich card rendering)
  const approvalData = {
    type: 'approve',
    title: openChat.title,
    link: openChat.external_link || null,
    code: openChat.access_code || null,
  };

  const { error } = await supabase.from('messages').insert({
    chat_room_id: chatRoomId,
    sender_id: auth.userId,
    content: JSON.stringify(approvalData),
    is_system: true,
  });

  if (error) return { error: error.message };
  revalidatePath('/chat');
  return { success: true };
}

// Image upload
export async function uploadOpenChatImage(file: FormData) {
  const auth = await requireAuth();
  const supabase = createClient();

  const imageFile = file.get('file') as File;
  if (!imageFile) return { error: 'No file provided' };

  const fileName = `${auth.userId}/${Date.now()}_${imageFile.name}`;
  const { data, error } = await supabase.storage
    .from('open-chat-images')
    .upload(fileName, imageFile);

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from('open-chat-images')
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

// Reviews
export async function getOpenChatReviews(openChatId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from('open_chat_reviews')
    .select('*, reviewer:profiles!reviewer_id(id, nickname, avatar_url)')
    .eq('open_chat_id', openChatId)
    .order('created_at', { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function createOpenChatReview(openChatId: string, rating: number, content: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  if (rating < 1 || rating > 5) {
    return { error: '별점은 1~5 사이여야 합니다' };
  }

  const { data: chat } = await supabase
    .from('open_chats')
    .select('id, creator_id')
    .eq('id', openChatId)
    .single();

  if (!chat) return { error: '오픈채팅을 찾을 수 없습니다' };

  if (chat.creator_id === auth.userId) {
    return { error: '본인이 만든 오픈채팅에는 리뷰를 남길 수 없습니다' };
  }

  const { error } = await supabase
    .from('open_chat_reviews')
    .insert({
      open_chat_id: openChatId,
      reviewer_id: auth.userId,
      rating,
      content: content?.trim() || null,
    });

  if (error) {
    if (error.code === '23505') {
      return { error: '이미 리뷰를 작성했습니다' };
    }
    return { error: error.message };
  }

  revalidatePath('/community/open-chats');
  return { success: true };
}

export async function deleteOpenChatReview(reviewId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: review } = await supabase
    .from('open_chat_reviews')
    .select('reviewer_id')
    .eq('id', reviewId)
    .single();

  if (!review || review.reviewer_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  const { error } = await supabase
    .from('open_chat_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) return { error: error.message };
  revalidatePath('/community/open-chats');
  return { success: true };
}
