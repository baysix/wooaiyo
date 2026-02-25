'use client';

import Link from 'next/link';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  showBack = false,
  showNotification = true,
  rightAction,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={() => window.history.back()}
            className="flex h-10 w-10 items-center justify-center -ml-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        ) : null}
        {title ? (
          <h1 className="text-lg font-bold">{title}</h1>
        ) : (
          <span className="text-xl font-bold text-[#20C997]">우아이요</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {rightAction}
        {showNotification && (
          <Link
            href="/notifications"
            className="flex h-10 w-10 items-center justify-center"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
