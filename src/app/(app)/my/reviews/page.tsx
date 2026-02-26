import Header from '@/components/layout/header';
import { getMyReviews } from '@/actions/reviews';
import { POST_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { PostType } from '@/types/database';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function MyReviewsPage() {
  const reviews = await getMyReviews();

  return (
    <>
      <Header title="받은 후기" showBack showNotification={false} />

      <div className="divide-y divide-gray-100">
        {reviews.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reviews.map((review: any) => (
            <div key={review.id} className="px-4 py-4">
              {/* Reviewer info + rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm overflow-hidden">
                    {review.reviewer?.avatar_url ? (
                      <img src={review.reviewer.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.reviewer?.nickname}</p>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                <span className="text-[11px] text-gray-400">{formatDate(review.created_at)}</span>
              </div>

              {/* Review content */}
              {review.content && (
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.content}</p>
              )}

              {/* Post reference */}
              {review.post && (
                <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-[11px] text-gray-400">
                  {POST_TYPE_LABELS[review.post.type as PostType]} · {review.post.title}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-14 w-14 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <p className="text-sm">아직 받은 후기가 없어요</p>
            <p className="text-xs mt-1">거래 완료 후 상대방이 후기를 남기면 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </>
  );
}
