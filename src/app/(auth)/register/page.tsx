'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signUp } from '@/actions/auth';
import { getActiveApartments } from '@/actions/apartments';
import SubmitButton from '@/components/ui/submit-button';
import { useLegalModal, LegalModal } from '@/components/legal-modal';
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

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const { legalModal, setLegalModal } = useLegalModal();

  useEffect(() => {
    getActiveApartments().then((data) => {
      if (data) setApartments(data as Apartment[]);
    });
  }, []);

  const selectedApt = apartments.find(
    (apt) => `${apt.name} (${apt.address})` === selectedValue
  );

  async function handleSubmit(formData: FormData) {
    setError(null);

    const password = formData.get('password') as string;
    const confirm = formData.get('confirm_password') as string;

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (!selectedApt) {
      setError('아파트를 선택해주세요');
      return;
    }

    formData.set('apartment_id', selectedApt.id);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#20C997]">우아이요</h1>
        <p className="mt-2 text-sm text-gray-500">회원가입</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
            placeholder="6자 이상"
          />
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
            비밀번호 확인
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
            placeholder="비밀번호를 다시 입력해주세요"
          />
        </div>

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
            아파트
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

        <div className="flex items-start gap-2">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#20C997]"
          />
          <label htmlFor="agree" className="text-xs text-gray-500 leading-relaxed">
            <button type="button" onClick={() => setLegalModal('terms')} className="text-[#20C997] underline">서비스 이용약관</button>
            {' '}및{' '}
            <button type="button" onClick={() => setLegalModal('privacy')} className="text-[#20C997] underline">개인정보처리방침</button>
            에 동의합니다.
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <SubmitButton loadingText="가입 중..." disabled={!selectedApt || !agreed}>
          회원가입
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold text-[#20C997]">
          로그인
        </Link>
      </p>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </>
  );
}
