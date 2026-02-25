import Link from 'next/link';
import type { OpenChatWithCreator } from '@/types/database';
import { OPEN_CHAT_TYPE_LABELS, OPEN_CHAT_TYPE_COLORS, OPEN_CHAT_CATEGORY_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export function OpenChatCard({
  chat,
  rating,
}: {
  chat: OpenChatWithCreator;
  rating?: { avg: number; count: number };
}) {
  const typeColor = OPEN_CHAT_TYPE_COLORS[chat.chat_type] ?? 'bg-gray-100 text-gray-800';
  const typeLabel = OPEN_CHAT_TYPE_LABELS[chat.chat_type] ?? chat.chat_type;
  const catColor = OPEN_CHAT_CATEGORY_COLORS[chat.category] ?? 'bg-gray-100 text-gray-800';

  return (
    <Link
      href={`/community/open-chats/${chat.id}`}
      className="flex gap-3 px-4 py-3 active:bg-gray-50"
    >
      {/* Thumbnail */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {chat.images && chat.images.length > 0 ? (
          <img src={chat.images[0]} alt={chat.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${typeColor}`}>
              {typeLabel}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${catColor}`}>
              {chat.category}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-1">{chat.title}</h3>
          {chat.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{chat.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {chat.creator.nickname} · {formatDate(chat.created_at)}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            {rating && rating.count > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-400">★</span>
                {rating.avg.toFixed(1)}
              </span>
            )}
            <span>조회 {chat.view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EmptyOpenChat() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
      <p className="text-sm">등록된 오픈채팅이 없어요</p>
    </div>
  );
}
