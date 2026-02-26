import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/header';
import { requireAuthWithRole, isAdmin } from '@/lib/auth';
import { getAdminStats } from '@/actions/admin';

export default async function AdminDashboardPage() {
  const auth = await requireAuthWithRole();
  if (!isAdmin(auth.role)) redirect('/home');

  const stats = await getAdminStats();

  return (
    <>
      <Header title="관리자 대시보드" showBack showNotification={false} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { label: '총 회원', value: stats.totalUsers, color: 'bg-blue-50 text-blue-700' },
          { label: '총 아파트', value: stats.totalApartments, color: 'bg-green-50 text-green-700' },
          { label: '총 게시글', value: stats.totalPosts, color: 'bg-purple-50 text-purple-700' },
          { label: '오늘 가입', value: stats.todaySignups, color: 'bg-orange-50 text-orange-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-xs font-medium opacity-70">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <section className="mt-2 bg-white">
        <h3 className="px-4 pt-4 pb-2 text-sm font-bold text-gray-900">관리 메뉴</h3>
        {[
          {
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            ),
            label: '회원 관리',
            desc: '회원 목록 조회 및 역할 변경',
            href: '/admin/users',
          },
          {
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21h13.5M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            ),
            label: '아파트 관리',
            desc: '아파트 목록 및 신규 등록',
            href: '/admin/apartments',
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-gray-400">{item.desc}</p>
              </div>
            </div>
            <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </section>
    </>
  );
}
