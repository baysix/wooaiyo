import Link from 'next/link';
import type { NoticeWithAuthor } from '@/types/database';
import { USER_ROLE_LABELS } from '@/lib/constants';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const ROLE_ICON: Record<string, string> = {
  admin: '🔔',
  manager: '🏢',
  resident: '📢',
};

export function NoticeCard({ notice }: { notice: NoticeWithAuthor }) {
  const roleLabel = USER_ROLE_LABELS[notice.author.role as keyof typeof USER_ROLE_LABELS] ?? '입주민';
  const roleIcon = ROLE_ICON[notice.author.role] ?? '📢';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = (notice as any).images as string[] | undefined;
  const thumbnail = images?.[0];

  return (
    <Link
      href={`/community/notices/${notice.id}`}
      className="flex gap-3 px-4 py-3.5 active:bg-gray-50"
    >
      {/* Thumbnail area */}
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : notice.author.avatar_url ? (
          <img src={notice.author.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">{roleIcon}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {notice.is_pinned && (
            <span className="inline-flex shrink-0 items-center rounded bg-[#20C997]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#20C997]">
              고정
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {notice.title}
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {notice.content}
        </p>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
          <span>{notice.author.nickname}</span>
          <span>·</span>
          <span>{roleLabel}</span>
          <span>·</span>
          <span>{formatDate(notice.created_at)}</span>
          {notice.view_count > 0 && (
            <>
              <span>·</span>
              <span>조회 {notice.view_count.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function EmptyNotice() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
      <p className="text-sm">등록된 공지사항이 없어요</p>
    </div>
  );
}
