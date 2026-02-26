'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/ui/global-loading';
import { toggleBookmark } from '@/actions/posts';
import { createOrGetPostChatRoom } from '@/actions/chats';

interface PostActionBarProps {
  postId: string;
  initialBookmarked: boolean;
}

export default function PostActionBar({ postId, initialBookmarked }: PostActionBarProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const globalLoading = useLoading();

  async function handleBookmark() {
    const result = await toggleBookmark(postId);
    if ('bookmarked' in result) {
      setBookmarked(result.bookmarked);
    }
  }

  async function handleChat() {
    setLoading(true);
    globalLoading.start();
    try {
      const result = await createOrGetPostChatRoom(postId);
      if ('error' in result) {
        alert(result.error);
        return;
      }
      router.push(`/chat/${result.roomId}`);
    } finally {
      setLoading(false);
      globalLoading.done();
    }
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <button
          onClick={handleBookmark}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200"
        >
          <svg
            className={`h-6 w-6 ${bookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            fill={bookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        <button
          onClick={handleChat}
          disabled={loading}
          className="flex-1 rounded-lg bg-[#20C997] py-3 text-center text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? '연결 중...' : '채팅하기'}
        </button>
      </div>
    </div>
  );
}
