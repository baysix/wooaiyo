'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import { useLoading } from '@/components/ui/global-loading';
import { getReviewTarget, createReview } from '@/actions/reviews';

const STAR_LABELS = ['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'];

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const globalLoading = useLoading();

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [target, setTarget] = useState<any>(null);

  useEffect(() => {
    async function fetch() {
      const data = await getReviewTarget(postId);
      if (!data || data.alreadyReviewed) {
        router.replace(`/post/${postId}`);
        return;
      }
      setTarget(data);
      setFetching(false);
    }
    fetch();
  }, [postId, router]);

  async function handleSubmit() {
    if (rating === 0) {
      setError('별점을 선택해주세요');
      return;
    }

    setLoading(true);
    setError('');
    globalLoading.start();

    try {
      const result = await createReview(postId, rating, content);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.replace(`/post/${postId}`);
    } finally {
      setLoading(false);
      globalLoading.done();
    }
  }

  if (fetching) {
    return (
      <>
        <Header title="거래 후기" showBack showNotification={false} />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="거래 후기" showBack showNotification={false} />

      <div className="px-4 py-6 space-y-6">
        {/* Target user */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl overflow-hidden">
            {target.reviewee.avatar_url ? (
              <img src={target.reviewee.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <p className="mt-2 text-sm font-semibold">{target.reviewee.nickname}</p>
          <p className="text-xs text-gray-400">
            {target.role === 'seller' ? '구매자에게 후기 남기기' : '판매자에게 후기 남기기'}
          </p>
        </div>

        {/* Star rating */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
              >
                <svg
                  className={`h-10 w-10 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm font-medium text-yellow-600">{STAR_LABELS[rating]}</p>
          )}
        </div>

        {/* Review content */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997] resize-none"
            placeholder="거래 경험을 공유해주세요 (선택)"
          />
          <p className="mt-1 text-right text-[11px] text-gray-400">{content.length}/500</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? '등록 중...' : '후기 등록'}
        </button>
      </div>
    </>
  );
}
