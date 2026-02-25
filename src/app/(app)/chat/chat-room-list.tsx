'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import type { ChatRoomItem } from './page';

interface Props {
  initialItems: ChatRoomItem[];
  currentUserId: string;
}

export default function ChatRoomList({ initialItems, currentUserId }: Props) {
  const [items, setItems] = useState(initialItems);

  // Subscribe to new messages across all my chat rooms
  useEffect(() => {
    if (items.length === 0) return;

    const supabase = createClient();
    const roomIds = new Set(items.map(item => item.id));

    const channel = supabase
      .channel('chat-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as {
            id: string;
            chat_room_id: string;
            sender_id: string;
            content: string;
            created_at: string;
          };

          // Only care about my chat rooms
          if (!roomIds.has(msg.chat_room_id)) return;

          setItems(prev =>
            prev.map(item => {
              if (item.id !== msg.chat_room_id) return item;
              return {
                ...item,
                lastMessage: { content: msg.content, created_at: msg.created_at },
                updated_at: msg.created_at,
                // Only increment unread if it's from the other user
                unread: msg.sender_id !== currentUserId ? item.unread + 1 : item.unread,
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [items.length, currentUserId]);

  // Sort: unread first, then by updated_at
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [items]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="h-16 w-16 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <p className="text-sm">아직 채팅이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {sorted.map(item => (
        <Link
          key={item.id}
          href={`/chat/${item.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
        >
          {/* Avatar with unread badge */}
          <div className="relative flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg overflow-hidden">
              {item.other.avatar_url ? (
                <img src={item.other.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            {item.unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {item.unread > 99 ? '99+' : item.unread}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={`text-sm truncate ${item.unread > 0 ? 'font-bold' : 'font-semibold'}`}>
                {item.other.nickname}
              </p>
              {item.lastMessage && (
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatDate(item.lastMessage.created_at)}
                </span>
              )}
            </div>
            <p className={`text-xs truncate mt-0.5 ${item.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {item.lastMessage?.content ?? '새로운 채팅방'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
