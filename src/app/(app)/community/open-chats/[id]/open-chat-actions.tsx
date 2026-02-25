'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteOpenChat } from '@/actions/open-chats';

export default function OpenChatActions({ chatId }: { chatId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    if (!confirm('오픈채팅을 삭제하시겠습니까?')) return;
    const result = await deleteOpenChat(chatId);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.replace('/community/open-chats');
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center"
      >
        <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <Link
              href={`/community/open-chats/${chatId}/edit`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
