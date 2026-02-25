import Header from '@/components/layout/header';
import Link from 'next/link';
import { getOpenChats } from '@/actions/open-chats';
import { OpenChatCard, EmptyOpenChat } from '@/components/open-chat/open-chat-list';
import type { OpenChatWithCreator } from '@/types/database';

export default async function OpenChatListPage() {
  const { chats, ratings } = await getOpenChats();
  const typedChats = chats as unknown as OpenChatWithCreator[];

  return (
    <>
      <Header
        title="오픈채팅"
        showBack
        rightAction={
          <Link
            href="/community/open-chats/new"
            className="flex h-10 w-10 items-center justify-center"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        }
      />
      <div className="divide-y divide-gray-100">
        {typedChats.length > 0 ? (
          typedChats.map((chat) => (
            <OpenChatCard key={chat.id} chat={chat} rating={ratings[chat.id]} />
          ))
        ) : (
          <EmptyOpenChat />
        )}
      </div>
    </>
  );
}
