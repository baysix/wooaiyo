'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/ui/global-loading';
import { createNotice, updateNotice } from '@/actions/notices';

interface NoticeFormProps {
  mode: 'create' | 'edit';
  noticeId?: string;
  defaultValues?: {
    title: string;
    content: string;
  };
}

export default function NoticeForm({ mode, noticeId, defaultValues }: NoticeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const globalLoading = useLoading();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    globalLoading.start();

    const formData = new FormData(e.currentTarget);

    const result = mode === 'create'
      ? await createNotice(formData)
      : await updateNotice(noticeId!, formData);

    if ('error' in result && result.error) {
      setError(result.error);
      setLoading(false);
      globalLoading.done();
      return;
    }

    if (mode === 'create' && 'id' in result) {
      router.replace(`/community/notices/${result.id}`);
    } else {
      router.replace(`/community/notices/${noticeId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={defaultValues?.title}
          placeholder="공지사항 제목을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
        <textarea
          name="content"
          required
          rows={10}
          defaultValue={defaultValues?.content}
          placeholder="공지사항 내용을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? '저장 중...' : mode === 'create' ? '공지사항 등록' : '공지사항 수정'}
      </button>
    </form>
  );
}
