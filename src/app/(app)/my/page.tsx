import Header from '@/components/layout/header';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { signOut } from '@/actions/auth';

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

  const menuItems = [
    { label: '내 글 목록', href: '/my/posts', icon: '📝' },
    { label: '거래 내역', href: '/my/transactions', icon: '🤝' },
    { label: '받은 후기', href: '/my/reviews', icon: '⭐' },
    { label: '키워드 알림 설정', href: '/my/keywords', icon: '🔔' },
    { label: '프로필 수정', href: '/my/profile/edit', icon: '✏️' },
    { label: '아파트 변경', href: '/my/apartment', icon: '🏠' },
  ];

  return (
    <>
      <Header title="나의" showNotification={false} />

      {/* Profile card */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.nickname ?? '사용자'}</h2>
            <p className="text-sm text-gray-500">{apartmentName}</p>
            <p className="text-xs text-[#20C997]">우아점수 {profile?.manner_score ?? 50}점</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="border-t border-gray-100">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-4 py-4 active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </div>
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="border-t border-gray-100 px-4 py-4">
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-gray-400"
          >
            로그아웃
          </button>
        </form>
      </div>
    </>
  );
}
