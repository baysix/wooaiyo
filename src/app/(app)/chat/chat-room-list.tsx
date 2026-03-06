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

const STATUS_LABEL: Record<string, string> = {
  reserved: '예약중',
  completed: '거래완료',
};

export default function ChatRoomList({ initialItems, currentUserId }: Props) {
  const [items, setItems] = useState(initialItems);

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

          if (!roomIds.has(msg.chat_room_id)) return;

          setItems(prev =>
            prev.map(item => {
              if (item.id !== msg.chat_room_id) return item;
              return {
                ...item,
                lastMessage: { content: msg.content, created_at: msg.created_at },
                updated_at: msg.created_at,
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

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [items]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-300">
        <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={0.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <p className="text-sm font-medium text-gray-400">아직 채팅이 없습니다</p>
        <p className="mt-1 text-xs">관심있는 게시글에서 채팅을 시작해보세요</p>
      </div>
    );
  }

  return (
    <div>
      {sorted.map(item => {
        const hasUnread = item.unread > 0;

        return (
          <Link
            key={item.id}
            href={`/chat/${item.id}`}
            className="flex gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative shrink-0 self-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg overflow-hidden">
                {item.other.avatar_url ? (
                  <img src={item.other.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Row 1: nickname + time */}
              <div className="flex items-center gap-1.5">
                <span className={`truncate text-[13px] ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                  {item.other.nickname}
                </span>
                {item.lastMessage && (
                  <span className="shrink-0 text-[11px] text-gray-300">
                    · {formatDate(item.lastMessage.created_at)}
                  </span>
                )}
              </div>

              {/* Row 2: last message */}
              <p className={`mt-0.5 truncate text-[12px] ${hasUnread ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                {item.lastMessage?.content ?? '새로운 채팅방'}
              </p>

              {/* Row 3: post info */}
              {item.post && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {item.post.status && STATUS_LABEL[item.post.status] && (
                    <span className={`shrink-0 rounded px-1.5 py-px text-[9px] font-bold ${
                      item.post.status === 'reserved'
                        ? 'bg-[#20C997]/10 text-[#20C997]'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {STATUS_LABEL[item.post.status]}
                    </span>
                  )}
                  <span className="truncate text-[11px] text-gray-400">
                    {item.post.title}
                  </span>
                </div>
              )}
            </div>

            {/* Right side: thumbnail + unread badge */}
            <div className="flex shrink-0 flex-col items-end gap-1.5 self-start">
              {item.post?.thumbnail ? (
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                  <img src={item.post.thumbnail} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-12 w-12" />
              )}
              {hasUnread && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF6B6B] px-1 text-[9px] font-bold text-white">
                  {item.unread > 99 ? '99+' : item.unread}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
