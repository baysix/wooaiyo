'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '@/actions/auth';
import SubmitButton from '@/components/ui/submit-button';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const password = formData.get('password') as string;
    const confirm = formData.get('confirm_password') as string;

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

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
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
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
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
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
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
            placeholder="비밀번호를 다시 입력해주세요"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <SubmitButton loadingText="가입 중...">회원가입</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold text-[#20C997]">
          로그인
        </Link>
      </p>
    </>
  );
}
