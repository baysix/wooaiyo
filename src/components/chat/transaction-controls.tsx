'use client';

import { useState } from 'react';
import Link from 'next/link';
import { changePostStatus } from '@/actions/posts';
import { sendSystemMessage } from '@/actions/chats';
import { POST_STATUS_LABELS, STATUS_COLORS, TYPE_COLORS, POST_TYPE_LABELS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { PostType, PostStatus } from '@/types/database';

interface PostInfo {
  id: string;
  title: string;
  images: string[];
  type: PostType;
  status: PostStatus;
  price: number | null;
  buyer_id: string | null;
}

interface TransactionControlsProps {
  post: PostInfo;
  chatRoomId: string;
  buyerId: string;
  isSeller: boolean;
}

export default function TransactionControls({ post, chatRoomId, buyerId, isSeller }: TransactionControlsProps) {
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: PostStatus) {
    if (loading) return;

    const messages: Record<string, string> = {
      reserved: '📌 예약이 시작되었습니다',
      active: '↩️ 예약이 취소되었습니다',
      completed: '✅ 거래가 완료되었습니다',
    };

    const confirmMessages: Record<string, string> = {
      reserved: '이 구매자와 예약하시겠습니까?',
      active: '예약을 취소하시겠습니까?',
      completed: '거래를 완료하시겠습니까?',
    };

    if (!confirm(confirmMessages[newStatus] ?? '상태를 변경하시겠습니까?')) return;

    setLoading(true);
    try {
      const result = await changePostStatus(
        post.id,
        newStatus,
        newStatus === 'reserved' ? buyerId : undefined
      );

      if (result.error) {
        alert(result.error);
        return;
      }

      setStatus(newStatus);

      // Send system message
      if (messages[newStatus]) {
        await sendSystemMessage(chatRoomId, messages[newStatus]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-gray-100 bg-white">
      {/* Post mini card */}
      <Link href={`/post/${post.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-gray-50">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
          {post.images?.[0] ? (
            <img src={post.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[post.type]}`}>
              {POST_TYPE_LABELS[post.type]}
            </span>
            {status !== 'active' && (
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[status]}`}>
                {POST_STATUS_LABELS[post.type][status]}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm font-medium text-gray-900 truncate">{post.title}</p>
          {post.price != null && (
            <p className="text-xs font-semibold text-[#20C997]">{formatPrice(post.price)}</p>
          )}
        </div>
        <svg className="h-4 w-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      {/* Transaction buttons */}
      {status !== 'hidden' && (
        <div className="flex gap-2 px-4 pb-3">
          {isSeller && status === 'active' && (
            <button
              onClick={() => handleStatusChange('reserved')}
              disabled={loading}
              className="flex-1 rounded-lg bg-yellow-50 border border-yellow-200 py-2 text-xs font-semibold text-yellow-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '예약하기'}
            </button>
          )}
          {isSeller && status === 'reserved' && (
            <>
              <button
                onClick={() => handleStatusChange('active')}
                disabled={loading}
                className="flex-1 rounded-lg bg-gray-50 border border-gray-200 py-2 text-xs font-semibold text-gray-600 disabled:opacity-50"
              >
                예약취소
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={loading}
                className="flex-1 rounded-lg bg-[#20C997] py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {loading ? '처리 중...' : '거래완료'}
              </button>
            </>
          )}
          {status === 'completed' && (
            <Link
              href={`/post/${post.id}/review`}
              className="flex-1 rounded-lg bg-[#20C997] py-2 text-center text-xs font-semibold text-white"
            >
              후기 작성
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
