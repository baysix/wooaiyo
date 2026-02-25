import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import { getOpenChat, getOpenChatReviews } from '@/actions/open-chats';
import { requireAuth } from '@/lib/auth';
import { OPEN_CHAT_TYPE_LABELS, OPEN_CHAT_CATEGORIES } from '@/lib/constants';
import type { OpenChatWithCreator, OpenChatReviewWithReviewer } from '@/types/database';
import AccessRequestButton from '@/components/open-chat/access-request-button';
import OpenChatActions from './open-chat-actions';
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
      <div className="relative">
        {chat.images && chat.images.length > 0 ? (
          <div className="flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
            {chat.images.map((img, i) => (
              <div key={i} className="h-72 w-full flex-shrink-0 snap-center">
                <img src={img} alt={`${chat.title} ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-300">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
        )}
        {chat.images && chat.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
            1/{chat.images.length}
          </div>
        )}
      </div>

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

      <div className="px-4 py-4 space-y-5 pb-32">
        <h1 className="text-lg font-bold text-gray-900">{chat.title}</h1>

        {/* 기본 정보 table */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">기본 정보</h2>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-500 w-24">유형</td>
                  <td className="px-4 py-2.5">{categoryInfo?.icon} {chat.category}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-500 w-24">참여가능자</td>
                  <td className="px-4 py-2.5">{chat.eligibility || '누구나'}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-500 w-24">채팅유형</td>
                  <td className="px-4 py-2.5">{OPEN_CHAT_TYPE_LABELS[chat.chat_type]}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-500 w-24">조회수</td>
                  <td className="px-4 py-2.5">{chat.view_count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        {chat.description && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">소개</h2>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {chat.description}
            </p>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Reviews */}
        <OpenChatReviewSection
          openChatId={chat.id}
          reviews={reviews}
          avgRating={avgRating}
          isCreator={isCreator}
          currentUserId={auth.userId}
        />
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3">
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
