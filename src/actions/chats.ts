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

  return { ...room, openChat };
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
