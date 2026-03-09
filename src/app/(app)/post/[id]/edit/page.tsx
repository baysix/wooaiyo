'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import { useLoading } from '@/components/ui/global-loading';
import { getPost, getPostFormData, updatePost, uploadPostImage } from '@/actions/posts';
import { POST_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import type { PostType, Category, ApartmentLocation } from '@/types/database';

const postTypes: PostType[] = ['sale', 'share', 'rental'];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [type, setType] = useState<PostType>('sale');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<ApartmentLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const globalLoading = useLoading();

  // Image state (existing + new)
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // Form defaults
  const [defaults, setDefaults] = useState<Record<string, unknown>>({});

  // Combobox state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [postResult, formData] = await Promise.all([
        getPost(postId),
        getPostFormData(),
      ]);

      if (!postResult.post || !postResult.isAuthor) {
        router.replace('/home');
        return;
      }

      const p = postResult.post;
      const cats = formData.categories as Category[];
      const locs = formData.locations as ApartmentLocation[];
      setCategories(cats);
      setLocations(locs);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = p as any;
      setType(post.type);
      setDefaults(post);
      setExistingImageUrls(post.images ?? []);
      setImagePreviews(post.images ?? []);

      // Set combobox defaults
      if (post.category_id) {
        const cat = cats.find((c) => c.id === post.category_id);
        if (cat) setSelectedCategory(`${cat.icon} ${cat.name}`);
      }
      if (post.location_id) {
        const loc = locs.find((l) => l.id === post.location_id);
        if (loc) setSelectedLocation(loc.name);
      }

      setFetching(false);
    }
    fetchData();
  }, [postId, router]);

  const matchedCategory = categories.find(
    (cat) => `${cat.icon} ${cat.name}` === selectedCategory
  );
  const matchedLocation = locations.find(
    (loc) => loc.name === selectedLocation
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - imagePreviews.length;
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
    setError(null);
    globalLoading.startBlocking();

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadPostImage(fd);
        if (result.error) throw new Error(result.error);
        if (result.url) uploadedUrls.push(result.url);
      }

      // Combine existing (kept) + new URLs
      const keptExisting = existingImageUrls.filter(url => imagePreviews.includes(url));
      const allImageUrls = [...keptExisting, ...uploadedUrls];

      const formData = new FormData(form);
      formData.set('type', type);
      formData.set('category_id', matchedCategory?.id ?? '');
      formData.set('location_id', matchedLocation?.id ?? '');
      const result = await updatePost(postId, formData, allImageUrls);

      if (result.error) throw new Error(result.error);

      router.replace(`/post/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
      globalLoading.done();
    }
  }

  if (fetching) {
    return (
      <>
        <Header title="글 수정" showBack showNotification={false} />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = defaults as any;

  return (
    <>
      <Header title="글 수정" showBack showNotification={false} />

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
            사진 ({imagePreviews.length}/10)
          </label>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {imagePreviews.length < 10 && (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            name="title"
            required
            maxLength={100}
            defaultValue={d.title}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base font-medium focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* Category - Combobox */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <Combobox
            items={categories.map((cat) => `${cat.icon} ${cat.name}`)}
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <ComboboxInput
              placeholder="카테고리를 선택하세요"
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={d.description}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997] resize-none"
            placeholder="내용을 입력해주세요"
          />
        </div>

        {/* Type-specific fields */}
        {type === 'sale' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
              <input
                name="price"
                type="number"
                min="0"
                defaultValue={d.price ?? ''}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
                placeholder="가격 (원)"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                name="is_negotiable"
                type="checkbox"
                defaultChecked={d.is_negotiable}
                className="h-4 w-4 rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]"
              />
              <span className="text-sm text-gray-600">가격 제안 받기</span>
            </label>
          </div>
        )}

        {type === 'share' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
            <input
              name="quantity"
              type="number"
              min="1"
              defaultValue={d.quantity ?? 1}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
              placeholder="수량 (선택)"
            />
          </div>
        )}

        {type === 'rental' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">보증금</label>
              <input
                name="deposit"
                type="number"
                min="0"
                defaultValue={d.deposit ?? ''}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
                placeholder="보증금 (원, 선택)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대여비</label>
              <input
                name="rental_fee"
                type="number"
                min="0"
                defaultValue={d.rental_fee ?? ''}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
                placeholder="대여비 (원, 선택)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대여 기간</label>
              <input
                name="rental_period"
                type="text"
                defaultValue={d.rental_period ?? ''}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
                placeholder="예: 7일, 1개월"
              />
            </div>
          </div>
        )}

        {/* Location - Combobox */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">거래 장소</label>
          <Combobox
            items={locations.map((loc) => loc.name)}
            value={selectedLocation}
            onValueChange={setSelectedLocation}
          >
            <ComboboxInput
              placeholder="거래 장소를 선택하세요"
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

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#20C997] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1BAE82] disabled:opacity-50"
        >
          {loading ? '수정 중...' : '수정하기'}
        </button>
      </form>
    </>
  );
}
