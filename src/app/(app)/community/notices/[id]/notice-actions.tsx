'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteNotice, toggleNoticePin } from '@/actions/notices';

interface NoticeActionsProps {
  noticeId: string;
  isPinned: boolean;
}

export default function NoticeActions({ noticeId, isPinned }: NoticeActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(isPinned);

  async function handleDelete() {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;
    const result = await deleteNotice(noticeId);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.replace('/community/notices');
  }

  async function handleTogglePin() {
    const result = await toggleNoticePin(noticeId);
    if (result.error) {
      alert(result.error);
      return;
    }
    setPinned(result.is_pinned!);
    setOpen(false);
    router.refresh();
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
            <button
              onClick={handleTogglePin}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {pinned ? '고정 해제' : '상단 고정'}
            </button>
            <Link
              href={`/community/notices/${noticeId}/edit`}
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
