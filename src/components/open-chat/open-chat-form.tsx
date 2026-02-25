'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOpenChat, updateOpenChat, uploadOpenChatImage } from '@/actions/open-chats';
import { OPEN_CHAT_CATEGORIES } from '@/lib/constants';
import type { OpenChatCategory } from '@/types/database';

interface OpenChatFormProps {
  mode: 'create' | 'edit';
  chatId?: string;
  defaultValues?: {
    title: string;
    description: string;
    chat_type: string;
    external_link: string;
    access_code: string;
    category: OpenChatCategory;
    eligibility: string;
    images: string[];
  };
}

export default function OpenChatForm({ mode, chatId, defaultValues }: OpenChatFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatType, setChatType] = useState(defaultValues?.chat_type ?? 'public');
  const [category, setCategory] = useState<OpenChatCategory>(defaultValues?.category ?? '기타');

  // Image state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(defaultValues?.images ?? []);
  const [existingImageUrls] = useState<string[]>(defaultValues?.images ?? []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - imagePreviews.length;
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

    // If it's a new (data-url) image, also remove from newImages
    if (removed.startsWith('data:')) {
      const newIdx = index - existingImageUrls.filter(url => imagePreviews.slice(0, index).includes(url)).length;
      setNewImages(prev => prev.filter((_, i) => i !== newIdx));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadOpenChatImage(fd);
        if (result.error) throw new Error(result.error);
        if (result.url) uploadedUrls.push(result.url);
      }

      // Combine existing (kept) + new URLs
      const keptExisting = existingImageUrls.filter(url => imagePreviews.includes(url));
      const allImageUrls = [...keptExisting, ...uploadedUrls];

      const formData = new FormData(e.currentTarget);

      const result = mode === 'create'
        ? await createOpenChat(formData, allImageUrls)
        : await updateOpenChat(chatId!, formData, allImageUrls);

      if ('error' in result && result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (mode === 'create' && 'id' in result) {
        router.replace(`/community/open-chats/${result.id}`);
      } else {
        router.replace(`/community/open-chats/${chatId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      setLoading(false);
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
          사진 ({imagePreviews.length}/5)
        </label>
        <div className="flex gap-2 overflow-x-auto">
          <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={imagePreviews.length >= 5}
            />
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </label>
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative h-20 w-20 flex-shrink-0">
              <img src={src} alt="" className="h-full w-full rounded-lg object-cover" />
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

      {/* Chat type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">채팅 유형</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setChatType('public')}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              chatType === 'public'
                ? 'border-[#20C997] bg-[#20C997]/5 text-[#20C997]'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            공개 채팅
          </button>
          <button
            type="button"
            onClick={() => setChatType('private')}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              chatType === 'private'
                ? 'border-[#20C997] bg-[#20C997]/5 text-[#20C997]'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            비공개 채팅
          </button>
        </div>
        <input type="hidden" name="chat_type" value={chatType} />
        <p className="mt-1.5 text-xs text-gray-400">
          {chatType === 'public'
            ? '외부 링크를 입력하면 바로 이동합니다'
            : '참여 요청 시 앱 내 채팅으로 연결됩니다'}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
        <div className="flex flex-wrap gap-2">
          {OPEN_CHAT_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat.value
                  ? 'bg-[#20C997] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={category} />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={defaultValues?.title}
          placeholder="오픈채팅 이름을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
        />
      </div>

      {/* Eligibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">참여가능자</label>
        <input
          name="eligibility"
          type="text"
          defaultValue={defaultValues?.eligibility}
          placeholder="예: 93년생, 뱀띠맘, 1단지 입주민 등"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
        />
        <p className="mt-1 text-xs text-gray-400">누구나 참여 가능하면 비워두세요</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaultValues?.description}
          placeholder="채팅방 소개를 작성해주세요 (선택)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997] resize-none"
        />
      </div>

      {/* External link (both public and private) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">참여 링크</label>
        <input
          name="external_link"
          type="url"
          defaultValue={defaultValues?.external_link}
          placeholder="https://open.kakao.com/..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
        />
        <p className="mt-1 text-xs text-gray-400">
          {chatType === 'public'
            ? '카카오톡, 텔레그램 등 오픈채팅 링크'
            : '참여 요청 승인 시 이 링크가 사용자에게 전달됩니다'}
        </p>
      </div>

      {/* Access code (private only) */}
      {chatType === 'private' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">참여 코드 (비밀번호)</label>
          <input
            name="access_code"
            type="text"
            defaultValue={defaultValues?.access_code}
            placeholder="오픈채팅 참여 비밀번호"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
          />
          <p className="mt-1 text-xs text-gray-400">참여 요청 승인 시 이 코드가 함께 전달됩니다</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? '저장 중...' : mode === 'create' ? '오픈채팅 등록' : '오픈채팅 수정'}
      </button>
    </form>
  );
}
