import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import { getNotice } from '@/actions/notices';
import { USER_ROLE_LABELS } from '@/lib/constants';
import type { NoticeWithAuthor } from '@/types/database';
import NoticeActions from './notice-actions';

interface Props {
  params: Promise<{ id: string }>;
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const { notice: raw, role } = await getNotice(id);

  if (!raw) notFound();

  const notice = raw as unknown as NoticeWithAuthor;
  const canEdit = notice.author.id === raw.author_id && role !== 'resident' || role === 'admin';

  const images = (notice as unknown as { images?: string[] }).images ?? [];

  return (
    <>
      <Header
        title="공지사항"
        showBack
        showNotification={false}
        rightAction={canEdit ? <NoticeActions noticeId={notice.id} isPinned={notice.is_pinned} /> : undefined}
      />

      {/* Thumbnail - first image */}
      {images[0] && (
        <div className="w-full">
          <img src={images[0]} alt={notice.title} className="h-56 w-full object-cover" />
        </div>
      )}

      <article className="px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          {notice.is_pinned && (
            <span className="inline-flex items-center rounded bg-[#20C997]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#20C997]">
              고정
            </span>
          )}
        </div>
        <h1 className="text-lg font-bold text-gray-900">{notice.title}</h1>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{notice.author.nickname}</span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
            {USER_ROLE_LABELS[notice.author.role as keyof typeof USER_ROLE_LABELS]}
          </span>
          <span className="text-gray-300">·</span>
          <span>{formatFullDate(notice.created_at)}</span>
          <span className="text-gray-300">·</span>
          <span>조회 {notice.view_count}</span>
        </div>

        <hr className="my-4 border-gray-100" />

        <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
          {notice.content}
        </div>

        {/* Body images - 2nd and 3rd */}
        {images.length > 1 && (
          <div className="mt-4 space-y-3">
            {images.slice(1).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`첨부 ${i + 2}`}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </article>
    </>
  );
}
