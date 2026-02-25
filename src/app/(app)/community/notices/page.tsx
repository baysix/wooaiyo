import Header from '@/components/layout/header';
import Link from 'next/link';
import { getNotices } from '@/actions/notices';
import { NoticeCard, EmptyNotice } from '@/components/notice/notice-list';
import type { NoticeWithAuthor } from '@/types/database';

export default async function NoticeListPage() {
  const { notices, role } = await getNotices();
  const canWrite = role === 'admin' || role === 'manager';
  const typedNotices = notices as unknown as NoticeWithAuthor[];

  return (
    <>
      <Header
        title="공지사항"
        showBack
        rightAction={
          canWrite ? (
            <Link
              href="/community/notices/new"
              className="flex h-10 w-10 items-center justify-center"
            >
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          ) : undefined
        }
      />
      <div className="divide-y divide-gray-100">
        {typedNotices.length > 0 ? (
          typedNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))
        ) : (
          <EmptyNotice />
        )}
      </div>
    </>
  );
}
