'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { getUsers, changeUserRole, getApartmentsList } from '@/actions/admin';
import { USER_ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/types/database';

const ROLE_COLORS: Record<UserRole, string> = {
  resident: 'bg-gray-100 text-gray-600',
  manager: 'bg-blue-100 text-blue-700',
  admin: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [apartmentFilter, setApartmentFilter] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apartments, setApartments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    getApartmentsList().then(setApartments);
  }, []);

  useEffect(() => {
    setLoading(true);
    getUsers(search || undefined, apartmentFilter || undefined, page).then((result) => {
      setUsers(result.users);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
  }, [search, apartmentFilter, page]);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (!confirm(`이 사용자의 역할을 "${USER_ROLE_LABELS[newRole]}"(으)로 변경하시겠습니까?`)) return;

    setChangingRole(userId);
    const result = await changeUserRole(userId, newRole);
    if (result.error) {
      alert(result.error);
    } else {
      // Refresh list
      const refreshed = await getUsers(search || undefined, apartmentFilter || undefined, page);
      setUsers(refreshed.users);
    }
    setChangingRole(null);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <>
      <Header title="회원 관리" showBack showNotification={false} />

      {/* Filters */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4 py-3 space-y-2">
        <input
          type="text"
          placeholder="닉네임 검색..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#20C997] focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <select
            value={apartmentFilter}
            onChange={(e) => { setApartmentFilter(e.target.value); setPage(1); }}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#20C997] focus:outline-none"
          >
            <option value="">전체 아파트</option>
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.id}>{apt.name}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 whitespace-nowrap">총 {total}명</span>
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">불러오는 중...</p>
          </div>
        ) : users.length > 0 ? (
          users.map((user) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const aptName = (user.apartments as any)?.[0]?.name ?? (user.apartments as any)?.name ?? '미설정';
            const role = user.role as UserRole;

            return (
              <div key={user.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{user.nickname}</p>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ROLE_COLORS[role]}`}>
                          {USER_ROLE_LABELS[role]}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{aptName}</p>
                    </div>
                  </div>

                  {/* Role selector */}
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    disabled={changingRole === user.id}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium focus:border-[#20C997] focus:outline-none disabled:opacity-50"
                  >
                    <option value="resident">입주민</option>
                    <option value="manager">아파트 운영자</option>
                    <option value="admin">플랫폼 운영자</option>
                  </select>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-xs text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
