import Header from '@/components/layout/header';

export default function NotificationsPage() {
  return (
    <>
      <Header title="알림" showBack showNotification={false} />
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-sm">알림이 없어요</p>
      </div>
    </>
  );
}
