import Header from '@/components/layout/header';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import ChatRoomList from './chat-room-list';

export interface ChatRoomItem {
  id: string;
  buyer_id: string;
  seller_id: string;
  updated_at: string;
  other: { id: string; nickname: string; avatar_url: string | null };
  lastMessage: { content: string; created_at: string } | null;
  unread: number;
  post: {
    id: string;
    title: string;
    price: number | null;
    status: string;
    thumbnail: string | null;
  } | null;
}

export default async function ChatListPage() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      buyer:profiles!buyer_id(id, nickname, avatar_url),
      seller:profiles!seller_id(id, nickname, avatar_url),
      post:posts(id, title, price, status, images)
    `)
    .or(`buyer_id.eq.${auth.userId},seller_id.eq.${auth.userId}`)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(50);

  const chatRooms = rooms ?? [];

  // Batch: get last messages and unread counts
  const roomIds = chatRooms.map(r => r.id);

  // Get last message per room (single query with window function workaround)
  const lastMessagesMap: Record<string, { content: string; created_at: string }> = {};
  const unreadMap: Record<string, number> = {};

  if (roomIds.length > 0) {
    // Last messages - fetch 1 per room
    const { data: allMsgs } = await supabase
      .from('messages')
      .select('chat_room_id, content, created_at')
      .in('chat_room_id', roomIds)
      .order('created_at', { ascending: false });

    if (allMsgs) {
      for (const msg of allMsgs) {
        if (!lastMessagesMap[msg.chat_room_id]) {
          lastMessagesMap[msg.chat_room_id] = { content: msg.content, created_at: msg.created_at };
        }
      }
    }

    // Unread counts - messages from others after my last read
    for (const room of chatRooms) {
      const isBuyer = room.buyer_id === auth.userId;
      const myLastRead = isBuyer ? room.buyer_last_read_at : room.seller_last_read_at;

      let query = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_room_id', room.id)
        .neq('sender_id', auth.userId);

      if (myLastRead) {
        query = query.gt('created_at', myLastRead);
      }

      const { count } = await query;
      unreadMap[room.id] = count ?? 0;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: ChatRoomItem[] = chatRooms.map((room: any) => {
    const isBuyer = room.buyer_id === auth.userId;
    const postData = room.post;

    return {
      id: room.id,
      buyer_id: room.buyer_id,
      seller_id: room.seller_id,
      updated_at: room.updated_at,
      other: isBuyer ? room.seller : room.buyer,
      lastMessage: lastMessagesMap[room.id] ?? null,
      unread: unreadMap[room.id] ?? 0,
      post: postData ? {
        id: postData.id,
        title: postData.title,
        price: postData.price,
        status: postData.status,
        thumbnail: postData.images?.[0] ?? null,
      } : null,
    };
  });

  return (
    <>
      <Header title="채팅" />
      <ChatRoomList initialItems={items} currentUserId={auth.userId} />
    </>
  );
}
