import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { PostCard, EmptyState } from '@/components/post/post-list';
import PostListHeader from '@/components/post/post-list-header';
import type { PostWithAuthor } from '@/types/database';

export default async function ShareListPage() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('apartment_id')
    .eq('id', auth.userId)
    .single();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles!author_id(id, nickname, avatar_url), category:categories(id, name, icon), location:apartment_locations(id, name)')
    .eq('apartment_id', profile?.apartment_id ?? '')
    .eq('type', 'share')
    .neq('status', 'hidden')
    .order('created_at', { ascending: false })
    .limit(50);

  const typedPosts = (posts ?? []) as unknown as PostWithAuthor[];

  return (
    <>
      <PostListHeader />
      <div className="divide-y divide-gray-100">
        {typedPosts.length > 0 ? (
          typedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState message="등록된 나눔 글이 없어요" />
        )}
      </div>
    </>
  );
}
