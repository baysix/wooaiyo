'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function getChatRoom(chatRoomId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: room } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      buyer:profiles!buyer_id(id, nickname, avatar_url),
      seller:profiles!seller_id(id, nickname, avatar_url)
    `)
    .eq('id', chatRoomId)
    .single();

  if (!room) return null;

  // Only participants can access
  if (room.buyer_id !== auth.userId && room.seller_id !== auth.userId) {
    return null;
  }

  // If it's a post chat room, fetch post details
  let post = null;
  if (room.post_id) {
    const { data } = await supabase
      .from('posts')
      .select('id, title, images, type, status, price, buyer_id')
      .eq('id', room.post_id)
      .single();
    post = data;
  }

  // If it's an open chat room, fetch open chat details
  let openChat = null;
  if (room.open_chat_id) {
    const { data } = await supabase
      .from('open_chats')
      .select('id, title, chat_type, creator_id')
      .eq('id', room.open_chat_id)
      .single();
    openChat = data;
  }

  // Mark as read on enter
  const readColumn = room.buyer_id === auth.userId ? 'buyer_last_read_at' : 'seller_last_read_at';
  await supabase
    .from('chat_rooms')
    .update({ [readColumn]: new Date().toISOString() })
    .eq('id', chatRoomId);

  return { ...room, openChat, post };
}

export async function getChatMessages(chatRoomId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Verify access
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('buyer_id, seller_id')
    .eq('id', chatRoomId)
    .single();

  if (!room || (room.buyer_id !== auth.userId && room.seller_id !== auth.userId)) {
    return [];
  }

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_room_id', chatRoomId)
    .order('created_at', { ascending: true })
    .limit(100);

  return data ?? [];
}

export async function sendMessage(chatRoomId: string, content: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Verify access
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('buyer_id, seller_id')
    .eq('id', chatRoomId)
    .single();

  if (!room || (room.buyer_id !== auth.userId && room.seller_id !== auth.userId)) {
    return { error: '권한이 없습니다' };
  }

  if (!content?.trim()) {
    return { error: '메시지를 입력해주세요' };
  }

  const now = new Date().toISOString();

  // Insert message
  const { error } = await supabase.from('messages').insert({
    chat_room_id: chatRoomId,
    sender_id: auth.userId,
    content: content.trim(),
  });

  if (error) return { error: error.message };

  // Update chat room: updated_at + sender's last_read_at
  const readColumn = room.buyer_id === auth.userId ? 'buyer_last_read_at' : 'seller_last_read_at';
  await supabase
    .from('chat_rooms')
    .update({ updated_at: now, [readColumn]: now })
    .eq('id', chatRoomId);

  revalidatePath('/chat');
  return { success: true };
}

export async function createOrGetPostChatRoom(postId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Get the post to find seller
  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', postId)
    .single();

  if (!post) return { error: '글을 찾을 수 없습니다' };
  if (post.author_id === auth.userId) return { error: '본인 글에는 채팅할 수 없습니다' };

  // Check if chat room already exists for this post + buyer
  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('post_id', postId)
    .eq('buyer_id', auth.userId)
    .single();

  if (existing) return { roomId: existing.id };

  // Create new chat room
  const { data: room, error } = await supabase
    .from('chat_rooms')
    .insert({
      post_id: postId,
      buyer_id: auth.userId,
      seller_id: post.author_id,
      buyer_last_read_at: new Date().toISOString(),
      seller_last_read_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Increment chat_count on the post
  const { data: postData } = await supabase.from('posts').select('chat_count').eq('id', postId).single();
  if (postData) {
    await supabase.from('posts').update({ chat_count: (postData.chat_count || 0) + 1 }).eq('id', postId);
  }

  revalidatePath('/chat');
  return { roomId: room!.id };
}

export async function sendSystemMessage(chatRoomId: string, content: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('messages') as any).insert({
    chat_room_id: chatRoomId,
    sender_id: auth.userId,
    content,
    is_system: true,
  });

  await supabase
    .from('chat_rooms')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatRoomId);
}

// Mark chat as read (called when user is viewing the chat)
export async function markChatAsRead(chatRoomId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: room } = await supabase
    .from('chat_rooms')
    .select('buyer_id, seller_id')
    .eq('id', chatRoomId)
    .single();

  if (!room || (room.buyer_id !== auth.userId && room.seller_id !== auth.userId)) {
    return;
  }

  const readColumn = room.buyer_id === auth.userId ? 'buyer_last_read_at' : 'seller_last_read_at';
  await supabase
    .from('chat_rooms')
    .update({ [readColumn]: new Date().toISOString() })
    .eq('id', chatRoomId);
}
