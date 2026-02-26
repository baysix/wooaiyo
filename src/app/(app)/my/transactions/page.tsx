'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import { getMyTransactions } from '@/actions/posts';
import { POST_TYPE_LABELS, TYPE_COLORS } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import type { PostType } from '@/types/database';

type Tab = 'sold' | 'bought';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TransactionCard({ post, role }: { post: any; role: 'sold' | 'bought' }) {
  const otherUser = role === 'sold' ? post.buyer : post.author;
  const postType = post.type as PostType;

  return (
    <div className="px-4 py-3.5">
      <Link
        href={`/post/${post.id}`}
        className="flex gap-3 active:bg-gray-50"
      >
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {post.images?.[0] ? (
            <img src={post.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[postType]}`}>
              {POST_TYPE_LABELS[postType]}
            </span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
              거래완료
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-gray-900 truncate">{post.title}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-bold text-[#20C997]">
              {postType === 'share' ? '나눔' : post.price ? formatPrice(post.price) : '가격 미정'}
            </span>
            <span className="text-[11px] text-gray-400">
              {otherUser?.nickname && `${role === 'sold' ? '구매자' : '판매자'}: ${otherUser.nickname}`}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-400">
            {post.completed_at ? formatDate(post.completed_at) : formatDate(post.updated_at)}
          </p>
        </div>
      </Link>

      {/* Review button */}
      {!post.hasReviewed && (
        <Link
          href={`/post/${post.id}/review`}
          className="mt-2 block rounded-lg bg-[#20C997] py-2 text-center text-xs font-semibold text-white active:bg-[#1bae82]"
        >
          후기 작성
        </Link>
      )}
      {post.hasReviewed && (
        <div className="mt-2 rounded-lg bg-gray-50 py-2 text-center text-xs font-medium text-gray-400">
          후기 작성 완료
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<Tab>('sold');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ sold: any[]; bought: any[] }>({ sold: [], bought: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const result = await getMyTransactions();
      setData(result);
      setLoading(false);
    }
    fetch();
  }, []);

  const posts = tab === 'sold' ? data.sold : data.bought;

  return (
    <>
      <Header title="거래내역" showBack showNotification={false} />

      <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4">
        <div className="flex">
          {(['sold', 'bought'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#20C997] text-[#20C997]'
                  : 'border-transparent text-gray-400'
              }`}
            >
              {t === 'sold' ? '판매' : '구매'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">불러오는 중...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => <TransactionCard key={post.id} post={post} role={tab} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p className="text-sm">{tab === 'sold' ? '판매 내역이 없어요' : '구매 내역이 없어요'}</p>
          </div>
        )}
      </div>
    </>
  );
}
