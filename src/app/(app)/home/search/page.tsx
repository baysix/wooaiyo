'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PostCard } from '@/components/post/post-list';
import { searchPosts } from '@/actions/posts';
import type { PostWithAuthor } from '@/types/database';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'sale', label: '판매' },
  { key: 'share', label: '나눔' },
  { key: 'rental', label: '대여' },
] as const;

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<PostWithAuthor[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(async (q: string, t: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchPosts(trimmed, t);
      setResults(data as PostWithAuthor[]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query, type), 300);
    return () => clearTimeout(timerRef.current);
  }, [query, type, doSearch]);

  // Auto focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {/* Header with search input */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 h-14">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center">
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-50 px-4 py-2.5">
            <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2 px-4 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setType(tab.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                type === tab.key
                  ? 'bg-[#20C997] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Results */}
      <div className="divide-y divide-gray-100">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#20C997]" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-sm">검색 결과가 없어요</p>
            <p className="text-xs mt-1">다른 검색어로 시도해보세요</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-sm">우리 아파트 물건을 검색해보세요</p>
            <p className="text-xs mt-1">제목이나 내용으로 검색할 수 있어요</p>
          </div>
        )}

        {!loading && results.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
