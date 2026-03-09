'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { getMyKeywords, addKeyword, removeKeyword, toggleKeyword } from '@/actions/keywords';

interface KeywordAlert {
  id: string;
  keyword: string;
  is_active: boolean;
  created_at: string;
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordAlert[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getMyKeywords().then((data) => {
      setKeywords(data as KeywordAlert[]);
      setLoading(false);
    });
  }, []);

  async function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed || adding) return;

    setAdding(true);
    try {
      const result = await addKeyword(trimmed);
      if ('error' in result) {
        alert(result.error);
        return;
      }
      setInput('');
      const data = await getMyKeywords();
      setKeywords(data as KeywordAlert[]);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    const result = await removeKeyword(id);
    if ('error' in result) {
      alert(result.error);
      return;
    }
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }

  async function handleToggle(id: string) {
    const result = await toggleKeyword(id);
    if ('error' in result) {
      alert(result.error);
      return;
    }
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, is_active: result.isActive } : k))
    );
  }

  return (
    <>
      <Header title="키워드 알림" showBack showNotification={false} />

      <div className="px-4 py-4 space-y-4">
        {/* Info */}
        <div className="rounded-xl bg-[#20C997]/5 p-4">
          <p className="text-sm font-medium text-gray-700">등록한 키워드가 포함된 글이 올라오면 알림을 보내드려요</p>
          <p className="mt-1 text-xs text-gray-400">최대 10개까지 등록할 수 있어요</p>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="키워드 입력 (예: 자전거, 에어컨)"
            maxLength={20}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || adding}
            className="shrink-0 rounded-lg bg-[#20C997] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {adding ? '...' : '추가'}
          </button>
        </div>

        {/* Keyword list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#20C997]" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm">등록된 키워드가 없어요</p>
            <p className="text-xs mt-1">원하는 물건의 키워드를 등록해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">{keywords.length}/10개 등록됨</p>
            {keywords.map((kw) => (
              <div
                key={kw.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <span className={`text-sm font-medium ${kw.is_active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {kw.keyword}
                </span>
                <div className="flex items-center gap-3">
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(kw.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      kw.is_active ? 'bg-[#20C997]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        kw.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleRemove(kw.id)}
                    className="text-gray-300 hover:text-red-400"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
