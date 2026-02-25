'use client';

import { useState, useEffect } from 'react';
import { setupProfile } from '@/actions/auth';
import { getActiveApartments } from '@/actions/apartments';
import type { Apartment } from '@/types/database';

export default function ProfileSetupPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApt, setSelectedApt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchApartments() {
      const data = await getActiveApartments();
      setApartments(data as Apartment[]);
    }
    fetchApartments();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await setupProfile(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#20C997]">우아이요</h1>
        <p className="mt-2 text-sm text-gray-500">프로필 설정</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            minLength={2}
            maxLength={20}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
            placeholder="2~20자"
          />
        </div>

        <div>
          <label htmlFor="apartment_id" className="block text-sm font-medium text-gray-700">
            우리 아파트 선택
          </label>
          <select
            id="apartment_id"
            name="apartment_id"
            required
            value={selectedApt}
            onChange={(e) => setSelectedApt(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
          >
            <option value="">아파트를 선택해주세요</option>
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.name} ({apt.address})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !selectedApt}
          className="w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1BAE82] disabled:opacity-50"
        >
          {loading ? '설정 중...' : '시작하기'}
        </button>
      </form>
    </>
  );
}
