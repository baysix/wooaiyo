import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import { getOpenChat, getOpenChatReviews } from '@/actions/open-chats';
import { requireAuth } from '@/lib/auth';
import { OPEN_CHAT_TYPE_LABELS, OPEN_CHAT_CATEGORIES } from '@/lib/constants';
import type { OpenChatWithCreator, OpenChatReviewWithReviewer } from '@/types/database';
import AccessRequestButton from '@/components/open-chat/access-request-button';
import OpenChatActions from './open-chat-actions';
import PostImageCarousel from '@/components/post/post-image-carousel';
import OpenChatReviewSection from '@/components/open-chat/open-chat-review';

interface Props {
  params: Promise<{ id: string }>;
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default async function OpenChatDetailPage({ params }: Props) {
  const { id } = await params;
  const auth = await requireAuth();
  const { openChat: raw, isCreator } = await getOpenChat(id);

  if (!raw) notFound();

  const chat = raw as unknown as OpenChatWithCreator;
  const reviews = (await getOpenChatReviews(id)) as unknown as OpenChatReviewWithReviewer[];

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const categoryInfo = OPEN_CHAT_CATEGORIES.find(c => c.value === chat.category);

  return (
    <>
      <Header
        showBack
        showNotification={false}
        rightAction={isCreator ? <OpenChatActions chatId={chat.id} /> : undefined}
      />

      {/* Image carousel */}
      <PostImageCarousel images={chat.images ?? []} title={chat.title} />

      {/* Creator info */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg overflow-hidden">
          {chat.creator.avatar_url ? (
            <img src={chat.creator.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{chat.creator.nickname}</p>
          <p className="text-xs text-gray-500">{formatFullDate(chat.created_at)}</p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-gray-900">{chat.title}</h1>
      </div>

      <div className="h-2 bg-gray-50" />

      {/* 기본 정보 */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2">기본 정보</h2>
        <div>
          <InfoRow label="유형" value={`${categoryInfo?.icon ?? ''} ${chat.category}`} />
          <InfoRow label="참여가능자" value={chat.eligibility || '누구나'} />
          <InfoRow label="채팅유형" value={OPEN_CHAT_TYPE_LABELS[chat.chat_type]} />
          <InfoRow label="조회수" value={`${chat.view_count}`} />
        </div>
      </div>

      <div className="h-2 bg-gray-50" />

      {/* 소개 */}
      {chat.description && (
        <>
          <div className="px-4 py-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">소개</h2>
            <p className="text-[13px] leading-relaxed text-gray-600 whitespace-pre-wrap">
              {chat.description}
            </p>
          </div>
          <div className="h-2 bg-gray-50" />
        </>
      )}

      {/* Reviews */}
      <div className="px-4 py-4 pb-32">
        <OpenChatReviewSection
          openChatId={chat.id}
          reviews={reviews}
          avgRating={avgRating}
          isCreator={isCreator}
          currentUserId={auth.userId}
        />
      </div>

      {/* Bottom action bar - fixed */}
      <div className="fixed left-0 right-0 border-t border-gray-100 bg-white px-4 py-3" style={{ bottom: 'calc(62px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto max-w-lg">
          {chat.chat_type === 'public' && chat.external_link ? (
            <a
              href={chat.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              참여하기
            </a>
          ) : !isCreator ? (
            <AccessRequestButton openChatId={chat.id} />
          ) : (
            <div className="rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-400">
              내가 만든 오픈채팅입니다
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-gray-50 py-2 last:border-b-0">
      <span className="w-20 shrink-0 text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-700">{value}</span>
    </div>
  );
}
