'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOpenChatAccess } from '@/actions/open-chats';

export default function AccessRequestButton({ openChatId }: { openChatId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    const result = await requestOpenChatAccess(openChatId);

    if ('error' in result && result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    if (result.chatRoomId) {
      router.push(`/chat/${result.chatRoomId}`);
    }
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white disabled:opacity-50"
    >
      {loading ? '요청 중...' : '참여 요청하기'}
    </button>
  );
}
