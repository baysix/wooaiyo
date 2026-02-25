import Link from 'next/link';
import { POST_STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import type { PostWithAuthor } from '@/types/database';

export function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="flex gap-3 px-4 py-3 active:bg-gray-50"
    >
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {post.images && post.images.length > 0 ? (
          <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate text-sm font-medium">{post.title}</h3>
          <div className="mt-1 flex items-center gap-1.5">
            {post.status !== 'active' && (
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[post.status]}`}>
                {POST_STATUS_LABELS[post.type][post.status]}
              </span>
            )}
            {post.category && (
              <span className="text-[10px] text-gray-400">{post.category.icon} {post.category.name}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {post.location?.name} · {formatDate(post.created_at)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            {post.type === 'share'
              ? '나눔'
              : post.type === 'rental'
              ? post.rental_fee ? formatPrice(post.rental_fee) + '/일' : '무료 대여'
              : post.price ? formatPrice(post.price) : '가격 미정'}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {post.chat_count > 0 && <span>채팅 {post.chat_count}</span>}
            {post.bookmark_count > 0 && <span>관심 {post.bookmark_count}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
      <p className="text-sm">{message}</p>
      <p className="text-xs mt-1">첫 번째 글을 올려보세요!</p>
    </div>
  );
}
