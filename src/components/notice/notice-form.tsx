'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/ui/global-loading';
import { createNotice, updateNotice, uploadNoticeImage } from '@/actions/notices';

interface NoticeFormProps {
  mode: 'create' | 'edit';
  noticeId?: string;
  defaultValues?: {
    title: string;
    content: string;
    images: string[];
  };
}

export default function NoticeForm({ mode, noticeId, defaultValues }: NoticeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const globalLoading = useLoading();

  // Image state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(defaultValues?.images ?? []);
  const [existingImageUrls] = useState<string[]>(defaultValues?.images ?? []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imagePreviews.length;
    const added = files.slice(0, remaining);

    setNewImages(prev => [...prev, ...added]);
    added.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    const removed = imagePreviews[index];
    setImagePreviews(prev => prev.filter((_, i) => i !== index));

    if (removed.startsWith('data:')) {
      const newIdx = index - existingImageUrls.filter(url => imagePreviews.slice(0, index).includes(url)).length;
      setNewImages(prev => prev.filter((_, i) => i !== newIdx));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError('');
    globalLoading.start();

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadNoticeImage(fd);
        if (result.error) throw new Error(result.error);
        if (result.url) uploadedUrls.push(result.url);
      }

      // Combine existing (kept) + new URLs
      const keptExisting = existingImageUrls.filter(url => imagePreviews.includes(url));
      const allImageUrls = [...keptExisting, ...uploadedUrls];

      const formData = new FormData(form);

      const result = mode === 'create'
        ? await createNotice(formData, allImageUrls)
        : await updateNotice(noticeId!, formData, allImageUrls);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      setLoading(false);
      globalLoading.done();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          첨부 이미지 ({imagePreviews.length}/3)
        </label>
        <p className="text-xs text-gray-400 mb-2">첫 번째 이미지가 썸네일로 사용됩니다</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {imagePreviews.length < 3 && (
            <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </label>
          )}
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative h-20 w-20 flex-shrink-0">
              <img src={src} alt="" className="h-full w-full rounded-lg object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 py-0.5 text-center text-[10px] text-white">
                  썸네일
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

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
