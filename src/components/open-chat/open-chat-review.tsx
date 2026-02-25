'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOpenChatReview, deleteOpenChatReview } from '@/actions/open-chats';
import type { OpenChatReviewWithReviewer } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface Props {
  openChatId: string;
  reviews: OpenChatReviewWithReviewer[];
  avgRating: number;
  isCreator: boolean;
  currentUserId: string;
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' | 'xl' }) {
  const cls = size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-lg' : 'text-xs';
  return (
    <span className={`flex gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function OpenChatReviewSection({ openChatId, reviews, avgRating, isCreator, currentUserId }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const hasReviewed = reviews.some(r => r.reviewer_id === currentUserId);

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    const result = await createOpenChatReview(openChatId, rating, content);
    if ('error' in result && result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }
    setShowForm(false);
    setContent('');
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    await deleteOpenChatReview(reviewId);
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">리뷰</h2>
          {reviews.length > 0 && (
            <span className="flex items-center gap-1 text-sm">
              <span className="text-yellow-400">★</span>
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({reviews.length})</span>
            </span>
          )}
        </div>
        {!isCreator && !hasReviewed && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-medium text-[#20C997]"
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            placeholder="리뷰를 작성해주세요 (선택)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-[#20C997] focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-[#20C997] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? '등록 중...' : '리뷰 등록'}
          </button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stars rating={review.rating} />
                <span className="text-xs font-medium text-gray-500">{review.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">{formatDate(review.created_at)}</span>
                {review.reviewer_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-[10px] text-red-400"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            {review.content && (
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.content}</p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-gray-200 overflow-hidden">
                {review.reviewer.avatar_url ? (
                  <img src={review.reviewer.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[8px]">👤</span>
                )}
              </div>
              <span className="text-[11px] text-gray-500">{review.reviewer.nickname}</span>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">아직 리뷰가 없어요</p>
        )}
      </div>
    </div>
  );
}
