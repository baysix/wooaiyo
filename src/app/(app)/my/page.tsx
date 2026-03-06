import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { signOut } from '@/actions/auth';
import { USER_ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/types/database';

export default async function MyPage() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, apartments(name)')
    .eq('id', auth.userId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as any;
  const apartmentName = profileData?.apartments?.[0]?.name ?? profileData?.apartments?.name ?? '';
  const role = (profile?.role ?? 'resident') as UserRole;
  const mannerScore = profile?.manner_score ?? 50;

  // Fetch stats
  const [myPostsRes, completedRes, chatRoomsRes] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', auth.userId).neq('status', 'hidden'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', auth.userId).eq('status', 'completed'),
    supabase.from('chat_rooms').select('id', { count: 'exact', head: true }).or(`buyer_id.eq.${auth.userId},seller_id.eq.${auth.userId}`),
  ]);

  const myPostCount = myPostsRes.count ?? 0;
  const completedCount = completedRes.count ?? 0;
  const chatCount = chatRoomsRes.count ?? 0;

  // Manner score color
  const scoreColor = mannerScore >= 70 ? 'text-[#20C997]' : mannerScore >= 40 ? 'text-yellow-500' : 'text-red-500';
  const scoreBg = mannerScore >= 70 ? 'bg-[#20C997]' : mannerScore >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white px-4">
        <div className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-bold">나의</h1>
          <Link href="/notifications" className="flex h-10 w-10 items-center justify-center">
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Profile Card */}
      <section className="bg-white px-4 pb-5 pt-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="truncate text-[17px] font-bold">{profile?.nickname ?? '사용자'}</h2>
              <Link href="/my/profile/edit" className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                편집
              </Link>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="shrink-0 rounded bg-[#20C997]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#20C997]">
                {USER_ROLE_LABELS[role]}
              </span>
              <span className="truncate text-xs text-gray-400">{apartmentName}</span>
            </div>
          </div>
        </div>

        {/* Manner Score Bar */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">우아점수</span>
            <span className={`text-sm font-bold ${scoreColor}`}>{mannerScore}점</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
            <div className={`h-full rounded-full ${scoreBg} transition-all`} style={{ width: `${mannerScore}%` }} />
          </div>
          <p className="mt-1.5 text-[10px] text-gray-400">
            {mannerScore >= 70 ? '이웃들에게 신뢰받는 이웃이에요!' : mannerScore >= 40 ? '좋은 이웃이 되어가고 있어요' : '우아점수를 올려보세요'}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-2 bg-white px-4 py-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <Link href="/my/posts" className="flex flex-col items-center gap-1 py-1">
            <span className="text-lg font-bold">{myPostCount}</span>
            <span className="text-[11px] text-gray-500">내 글</span>
          </Link>
          <Link href="/my/transactions" className="flex flex-col items-center gap-1 py-1">
            <span className="text-lg font-bold">{completedCount}</span>
            <span className="text-[11px] text-gray-500">거래완료</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1 py-1">
            <span className="text-lg font-bold">{chatCount}</span>
            <span className="text-[11px] text-gray-500">채팅</span>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-2 bg-white px-4 py-4">
        <h3 className="mb-3 text-sm font-bold">나의 활동</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '📝', label: '내 글', href: '/my/posts' },
            { icon: '🤝', label: '거래내역', href: '/my/transactions' },
            { icon: '⭐', label: '받은후기', href: '/my/reviews' },
            { icon: '❤️', label: '관심목록', href: '/my/favorites' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 py-3.5 active:bg-gray-100 transition-colors">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Admin Menu - Platform Admin */}
      {role === 'admin' && (
        <section className="mt-2 bg-white">
          <h3 className="px-4 pt-4 pb-1 text-sm font-bold">플랫폼 관리</h3>
          {[
            { icon: '🛡️', label: '관리자 대시보드', desc: '플랫폼 전체 통계 및 관리', href: '/admin' },
            { icon: '👥', label: '회원 관리', desc: '회원 조회 및 역할 변경', href: '/admin/users' },
            { icon: '🏢', label: '아파트 관리', desc: '아파트 목록 및 신규 등록', href: '/admin/apartments' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-base">{item.icon}</span>
                <div>
                  <span className="text-sm font-medium">{item.label}</span>
                  <p className="text-[11px] text-gray-400">{item.desc}</p>
                </div>
              </div>
              <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </section>
      )}

      {/* Manager Menu - Apartment Manager */}
      {role === 'manager' && (
        <section className="mt-2 bg-white">
          <h3 className="px-4 pt-4 pb-1 text-sm font-bold">아파트 운영</h3>
          <Link
            href="/community/notices"
            className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-base">📢</span>
              <div>
                <span className="text-sm font-medium">공지사항 관리</span>
                <p className="text-[11px] text-gray-400">아파트 공지사항 작성 및 관리</p>
              </div>
            </div>
            <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </section>
      )}

      {/* Settings Menu */}
      <section className="mt-2 bg-white">
        <h3 className="px-4 pt-4 pb-1 text-sm font-bold">설정</h3>
        {[
          { icon: '🔔', label: '키워드 알림 설정', desc: '원하는 물건이 올라오면 알림', href: '/my/keywords' },
          { icon: '🏠', label: '아파트 변경', desc: apartmentName || '아파트 설정', href: '/my/apartment' },
          { icon: '💬', label: '문의하기', desc: '네이버 카페에서 문의', href: 'https://cafe.naver.com/wooaiyo', external: true },
        ].map((item) => {
          const content = (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-base">{item.icon}</span>
                <div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.desc && <p className="text-[11px] text-gray-400">{item.desc}</p>}
                </div>
              </div>
              <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </>
          );
          const className = "flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors";
          return 'external' in item && item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
          ) : (
            <Link key={item.href} href={item.href} className={className}>{content}</Link>
          );
        })}
      </section>

      {/* Sign out + App info */}
      <section className="mt-2 bg-white px-4 py-4">
        <form action={signOut}>
          <button type="submit" className="text-sm text-gray-400 active:text-gray-600 transition-colors">
            로그아웃
          </button>
        </form>
        <p className="mt-3 text-[10px] text-gray-300">우아이요 v0.1.0</p>
        <div className="mt-2 flex gap-2 text-[10px] text-gray-300">
          <Link href="/terms" className="underline">이용약관</Link>
          <span>|</span>
          <Link href="/privacy" className="underline">개인정보처리방침</Link>
        </div>
      </section>

      <div className="h-4" />
    </div>
  );
}
