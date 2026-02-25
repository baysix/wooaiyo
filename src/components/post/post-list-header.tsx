'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { PostType } from '@/types/database';

const tabs: { type: PostType; label: string; href: string }[] = [
  { type: 'sale', label: '중고판매', href: '/home/sale' },
  { type: 'share', label: '나눔', href: '/home/share' },
  { type: 'rental', label: '대여', href: '/home/rental' },
];

export default function PostListHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Top row: back + title */}
      <div className="flex h-14 items-center px-4 border-b border-gray-100">
        <Link href="/home" className="flex h-10 w-10 items-center justify-center -ml-2">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <span className="text-lg font-bold">우리아파트 물건</span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.type}
              href={tab.href}
              replace
              className={cn(
                'flex-1 py-3 text-center text-sm font-medium transition-colors relative',
                isActive ? 'text-[#20C997]' : 'text-gray-400'
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 rounded-full bg-[#20C997]" />
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
