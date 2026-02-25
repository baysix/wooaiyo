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
}

export default async function ChatListPage() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      buyer:profiles!buyer_id(id, nickname, avatar_url),
      seller:profiles!seller_id(id, nickname, avatar_url)
    `)
    .or(`buyer_id.eq.${auth.userId},seller_id.eq.${auth.userId}`)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(50);

  const chatRooms = rooms ?? [];

  // Build items with last message + unread count
  const items: ChatRoomItem[] = [];

  for (const room of chatRooms) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('content, created_at')
      .eq('chat_room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const isBuyer = room.buyer_id === auth.userId;
    const myLastRead = isBuyer ? room.buyer_last_read_at : room.seller_last_read_at;

    let unread = 0;
    if (myLastRead) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_room_id', room.id)
        .neq('sender_id', auth.userId)
        .gt('created_at', myLastRead);
      unread = count ?? 0;
    } else {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_room_id', room.id)
        .neq('sender_id', auth.userId);
      unread = count ?? 0;
    }

    items.push({
      id: room.id,
      buyer_id: room.buyer_id,
      seller_id: room.seller_id,
      updated_at: room.updated_at,
      other: isBuyer ? room.seller : room.buyer,
      lastMessage: msgs && msgs.length > 0 ? msgs[0] : null,
      unread,
    });
  }

  return (
    <>
      <Header title="채팅" />
      <ChatRoomList initialItems={items} currentUserId={auth.userId} />
    </>
  );
}
