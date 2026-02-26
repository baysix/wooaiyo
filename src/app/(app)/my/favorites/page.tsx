import Header from '@/components/layout/header';
import { PostCard, EmptyState } from '@/components/post/post-list';
import { getMyFavorites } from '@/actions/posts';
import type { PostWithAuthor } from '@/types/database';

export default async function FavoritesPage() {
  const posts = await getMyFavorites() as unknown as PostWithAuthor[];

  return (
    <>
      <Header title="관심목록" showBack showNotification={false} />
      <div className="divide-y divide-gray-100">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="text-sm">관심 목록이 비어있어요</p>
            <p className="text-xs mt-1">마음에 드는 글에 하트를 눌러보세요</p>
          </div>
        )}
      </div>
    </>
  );
}
