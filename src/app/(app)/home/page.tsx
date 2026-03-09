import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export default async function HomePage() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('apartment_id, apartments(name)')
    .eq('id', auth.userId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as any;
  const apartmentName = profileData?.apartments?.[0]?.name ?? profileData?.apartments?.name ?? '아파트';

  // Get counts for badges
  const apartmentId = profile?.apartment_id ?? '';
  const [saleCount, shareCount, rentalCount, noticeCount, openChatCount] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('apartment_id', apartmentId).eq('type', 'sale').neq('status', 'hidden'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('apartment_id', apartmentId).eq('type', 'share').neq('status', 'hidden'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('apartment_id', apartmentId).eq('type', 'rental').neq('status', 'hidden'),
    supabase.from('notices').select('id', { count: 'exact', head: true }).eq('apartment_id', apartmentId),
    supabase.from('open_chats').select('id', { count: 'exact', head: true }).eq('apartment_id', apartmentId),
  ]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white px-4">
        <div className="flex h-14 items-center justify-between">
          <img src="/logo_txt.png" alt="우아이요" className="h-6" />
          <div className="flex items-center gap-1">
            <Link href="/notifications" className="flex h-10 w-10 items-center justify-center">
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <Link
          href="/home/search"
          className="mb-3 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5"
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-sm text-gray-400">우리 아파트 물건 검색</span>
        </Link>
      </header>

      <div>
        {/* Banner area */}
        <section className="px-4 pt-2 pb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#20C997] to-[#0CA678] px-5 py-6 text-white">
            <div className="relative z-10">
              <p className="text-xs font-medium opacity-80">{apartmentName}</p>
              <h2 className="mt-1 text-lg font-bold leading-snug">
                우리 아파트에서<br />필요한 것을 찾아보세요
              </h2>
              <p className="mt-2 text-xs opacity-70">이웃과 함께하는 나눔·거래·대여</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -right-2 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute bottom-2 right-4 text-4xl">🏠</div>
          </div>
        </section>

        {/* Quick menu buttons */}
        <section className="px-4 pb-4">
          {/* Main button: 중고판매 */}
          <Link
            href="/home/sale"
            className="mb-3 flex items-center justify-between rounded-2xl bg-blue-50 px-5 py-5 active:bg-blue-100 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <h3 className="text-lg font-bold text-gray-900">중고판매</h3>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-10">
                {saleCount.count ? `${saleCount.count}개의 물건이 거래중` : '우리 아파트 중고거래'}
              </p>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

          {/* 4 sub buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Link
              href="/home/share"
              className="flex flex-col items-center gap-1.5 rounded-xl bg-pink-50 px-2 py-4 active:bg-pink-100 transition-colors"
            >
              <span className="text-2xl">🤝</span>
              <span className="text-xs font-semibold text-gray-700">나눔</span>
              {shareCount.count ? (
                <span className="text-[10px] text-gray-400">{shareCount.count}건</span>
              ) : (
                <span className="text-[10px] text-gray-400">-</span>
              )}
            </Link>

            <Link
              href="/home/rental"
              className="flex flex-col items-center gap-1.5 rounded-xl bg-purple-50 px-2 py-4 active:bg-purple-100 transition-colors"
            >
              <span className="text-2xl">📦</span>
              <span className="text-xs font-semibold text-gray-700">대여</span>
              {rentalCount.count ? (
                <span className="text-[10px] text-gray-400">{rentalCount.count}건</span>
              ) : (
                <span className="text-[10px] text-gray-400">-</span>
              )}
            </Link>

            <Link
              href="/community/notices"
              className="flex flex-col items-center gap-1.5 rounded-xl bg-[#20C997]/5 px-2 py-4 active:bg-[#20C997]/10 transition-colors"
            >
              <span className="text-2xl">📢</span>
              <span className="text-xs font-semibold text-gray-700">공지사항</span>
              {noticeCount.count ? (
                <span className="text-[10px] text-gray-400">{noticeCount.count}건</span>
              ) : (
                <span className="text-[10px] text-gray-400">-</span>
              )}
            </Link>

            <Link
              href="/community/open-chats"
              className="flex flex-col items-center gap-1.5 rounded-xl bg-orange-50 px-2 py-4 active:bg-orange-100 transition-colors"
            >
              <span className="text-2xl">💬</span>
              <span className="text-xs font-semibold text-gray-700">오픈채팅</span>
              {openChatCount.count ? (
                <span className="text-[10px] text-gray-400">{openChatCount.count}건</span>
              ) : (
                <span className="text-[10px] text-gray-400">-</span>
              )}
            </Link>
          </div>
        </section>

        <div className="h-2 bg-gray-50" />

        {/* Recent activity / tips section */}
        <section className="px-4 py-4">
          <h2 className="text-sm font-bold mb-3">우리 아파트 소식</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#20C997]/10">
                <svg className="h-4 w-4 text-[#20C997]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">물건을 등록해보세요</p>
                <p className="text-xs text-gray-400">안 쓰는 물건, 이웃에게 나눠보세요</p>
              </div>
              <Link href="/post/new" className="rounded-full bg-[#20C997] px-3 py-1.5 text-xs font-medium text-white">
                등록하기
              </Link>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">키워드 알림 설정</p>
                <p className="text-xs text-gray-400">원하는 물건이 올라오면 바로 알려드려요</p>
              </div>
              <Link href="/my/keywords" className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
                설정하기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
