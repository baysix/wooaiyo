'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { getApartmentsList, createApartment } from '@/actions/admin';

export default function AdminApartmentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApartments();
  }, []);

  async function loadApartments() {
    setLoading(true);
    const data = await getApartmentsList();
    setApartments(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createApartment(formData);

    if (result.error) {
      alert(result.error);
    } else {
      form.reset();
      setShowForm(false);
      await loadApartments();
    }
    setSubmitting(false);
  }

  return (
    <>
      <Header
        title="아파트 관리"
        showBack
        showNotification={false}
        rightAction={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex h-10 w-10 items-center justify-center"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        }
      />

      {/* Add Apartment Form */}
      {showForm && (
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
          <h3 className="mb-3 text-sm font-bold">새 아파트 등록</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              name="name"
              type="text"
              placeholder="아파트 이름 *"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none"
            />
            <input
              name="address"
              type="text"
              placeholder="주소 *"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                name="city"
                type="text"
                placeholder="시/도"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none"
              />
              <input
                name="district"
                type="text"
                placeholder="구/군"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#20C997] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Apartment List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">불러오는 중...</p>
          </div>
        ) : apartments.length > 0 ? (
          apartments.map((apt) => (
            <div key={apt.id} className="px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{apt.name}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400 truncate">{apt.address}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 ml-3">
                  <div className="text-center">
                    <p className="font-bold text-sm">{apt.residentCount}</p>
                    <p className="text-gray-400">입주민</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-blue-600">{apt.managerCount}</p>
                    <p className="text-gray-400">운영자</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-14 w-14 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21h13.5M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <p className="text-sm">등록된 아파트가 없습니다</p>
            <p className="text-xs mt-1">상단 + 버튼으로 아파트를 등록하세요</p>
          </div>
        )}
      </div>
    </>
  );
}
