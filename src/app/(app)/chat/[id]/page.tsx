import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getChatRoom, getChatMessages } from '@/actions/chats';
import ChatView from './chat-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  const auth = await requireAuth();
  const room = await getChatRoom(id);

  if (!room) notFound();

  const messages = await getChatMessages(id);

  const otherUser = room.buyer_id === auth.userId ? room.seller : room.buyer;
  const isCreator = room.openChat?.creator_id === auth.userId;

  return (
    <ChatView
      chatRoomId={room.id}
      currentUserId={auth.userId}
      otherUser={otherUser}
      messages={messages}
      openChat={room.openChat}
      isCreator={isCreator}
    />
  );
}
