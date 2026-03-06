'use client';

import { useState, useEffect } from 'react';
import { setupProfile } from '@/actions/auth';
import { getActiveApartments } from '@/actions/apartments';
import SubmitButton from '@/components/ui/submit-button';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';

interface Apartment {
  id: string;
  name: string;
  address: string;
}

export default function ProfileSetupPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApartments() {
      const data = await getActiveApartments();
      setApartments(data as Apartment[]);
    }
    fetchApartments();
  }, []);

  const selectedApt = apartments.find(
    (apt) => `${apt.name} (${apt.address})` === selectedValue
  );

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (!selectedApt) {
      setError('아파트를 선택해주세요');
      return;
    }

    formData.set('apartment_id', selectedApt.id);
    const result = await setupProfile(formData);
    if (result?.error) {
      setError(result.error);
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
            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
            placeholder="2~20자"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            우리 아파트 선택
          </label>
          <div className="mt-1">
            <Combobox
              items={apartments.map((apt) => `${apt.name} (${apt.address})`)}
              value={selectedValue}
              onValueChange={setSelectedValue}
            >
              <ComboboxInput
                placeholder="아파트를 검색해주세요"
                className="w-full"
              />
              <ComboboxContent>
                <ComboboxEmpty>검색 결과가 없습니다</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <input type="hidden" name="apartment_id" value={selectedApt?.id ?? ''} />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <SubmitButton loadingText="설정 중..." disabled={!selectedApt}>시작하기</SubmitButton>
      </form>
    </>
  );
}
