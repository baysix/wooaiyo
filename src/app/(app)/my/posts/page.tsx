'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import { getMyPosts } from '@/actions/posts';
import { POST_TYPE_LABELS, POST_STATUS_LABELS, STATUS_COLORS, TYPE_COLORS } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import type { PostStatus, PostType } from '@/types/database';

const tabs: { label: string; status: PostStatus | null }[] = [
  { label: '전체', status: null },
  { label: '판매중', status: 'active' },
  { label: '예약중', status: 'reserved' },
  { label: '거래완료', status: 'completed' },
  { label: '숨김', status: 'hidden' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MyPostCard({ post }: { post: any }) {
  const postType = post.type as PostType;
  const postStatus = post.status as PostStatus;
  const thumbnail = post.images?.[0];

  return (
    <Link
      href={`/post/${post.id}`}
      className="flex gap-3 px-4 py-3.5 active:bg-gray-50"
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 truncate">{post.title}</h3>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[postType]}`}>
            {POST_TYPE_LABELS[postType]}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[postStatus]}`}>
            {POST_STATUS_LABELS[postType][postStatus]}
          </span>
        </div>

        {/* Price + meta */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-gray-900">
            {postType === 'share'
              ? '나눔'
              : postType === 'rental'
              ? post.rental_fee ? formatPrice(post.rental_fee) : '무료 대여'
              : post.price ? formatPrice(post.price) : '가격 미정'}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            {post.chat_count > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                {post.chat_count}
              </span>
            )}
            {post.bookmark_count > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {post.bookmark_count}
              </span>
            )}
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MyPostsPage() {
  const [activeTab, setActiveTab] = useState<PostStatus | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const data = await getMyPosts(activeTab ?? undefined);
      setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, [activeTab]);

  return (
    <>
      <Header title="내 글" showBack showNotification={false} />

      {/* Status tabs */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.status)}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">불러오는 중...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => <MyPostCard key={post.id} post={post} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-14 w-14 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm">
              {activeTab === 'hidden' ? '숨긴 글이 없어요' : '작성한 글이 없어요'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
