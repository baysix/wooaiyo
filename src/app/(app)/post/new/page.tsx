'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { getPostFormData, createPost, uploadPostImage } from '@/actions/posts';
import { POST_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { PostType, Category, ApartmentLocation } from '@/types/database';

const postTypes: PostType[] = ['sale', 'share', 'rental'];

export default function NewPostPage() {
  const router = useRouter();
  const [type, setType] = useState<PostType>('sale');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<ApartmentLocation[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getPostFormData();
      setCategories(data.categories as Category[]);
      setLocations(data.locations as ApartmentLocation[]);
    }
    fetchData();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - images.length;
    const newFiles = files.slice(0, remaining);

    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);

    try {
      // Upload images via server action
      const imageUrls: string[] = [];
      for (const file of images) {
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadPostImage(fd);
        if (result.error) throw new Error(result.error);
        if (result.url) imageUrls.push(result.url);
      }

      // Create post via server action
      const formData = new FormData(form);
      formData.set('type', type);
      const result = await createPost(formData, imageUrls);

      if (result.error) throw new Error(result.error);

      router.push('/home');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="글쓰기" showBack showNotification={false} />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        {/* Type selection */}
        <div className="flex gap-2">
          {postTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors',
                type === t
                  ? 'bg-[#20C997] text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {POST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진 ({images.length}/10)
          </label>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={images.length >= 10}
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

        {/* Title */}
        <div>
          <input
            name="title"
            required
            maxLength={100}
            className="w-full border-b border-gray-200 py-3 text-base focus:border-[#20C997] focus:outline-none"
            placeholder="제목"
          />
        </div>

        {/* Category */}
        <div>
          <select
            name="category_id"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <textarea
            name="description"
            required
            rows={5}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none resize-none"
            placeholder="내용을 입력해주세요"
          />
        </div>

        {/* Type-specific fields */}
        {type === 'sale' && (
          <div className="space-y-3">
            <input
              name="price"
              type="number"
              min="0"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
              placeholder="가격 (원)"
            />
            <label className="flex items-center gap-2">
              <input
                name="is_negotiable"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]"
              />
              <span className="text-sm text-gray-600">가격 제안 받기</span>
            </label>
          </div>
        )}

        {type === 'share' && (
          <div>
            <input
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
              placeholder="수량 (선택)"
            />
          </div>
        )}

        {type === 'rental' && (
          <div className="space-y-3">
            <input
              name="deposit"
              type="number"
              min="0"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
              placeholder="보증금 (원, 선택)"
            />
            <input
              name="rental_fee"
              type="number"
              min="0"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
              placeholder="대여비 (원, 선택)"
            />
            <input
              name="rental_period"
              type="text"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
              placeholder="대여 기간 (예: 7일, 1개월)"
            />
          </div>
        )}

        {/* Location */}
        <div>
          <select
            name="location_id"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none"
          >
            <option value="">거래 장소 선택</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#20C997] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1BAE82] disabled:opacity-50"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </>
  );
}
