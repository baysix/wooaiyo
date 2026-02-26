'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function getReviewTarget(postId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Get the post with buyer info
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, images, type, status, author_id, buyer_id')
    .eq('id', postId)
    .single();

  if (!post || post.status !== 'completed') return null;

  // Determine who to review
  const isSeller = post.author_id === auth.userId;
  const isBuyer = post.buyer_id === auth.userId;

  if (!isSeller && !isBuyer) return null;

  const revieweeId = isSeller ? post.buyer_id! : post.author_id;

  // Get reviewee profile
  const { data: reviewee } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url')
    .eq('id', revieweeId)
    .single();

  if (!reviewee) return null;

  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('post_id', postId)
    .eq('reviewer_id', auth.userId)
    .single();

  return {
    post,
    reviewee,
    alreadyReviewed: !!existing,
    role: isSeller ? 'seller' as const : 'buyer' as const,
  };
}

export async function createReview(postId: string, rating: number, content: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Validate rating
  if (rating < 1 || rating > 5) return { error: '별점은 1~5점이어야 합니다' };

  // Get post to determine reviewee
  const { data: post } = await supabase
    .from('posts')
    .select('author_id, buyer_id, status')
    .eq('id', postId)
    .single();

  if (!post || post.status !== 'completed') {
    return { error: '거래 완료된 글만 리뷰할 수 있습니다' };
  }

  const isSeller = post.author_id === auth.userId;
  const isBuyer = post.buyer_id === auth.userId;
  if (!isSeller && !isBuyer) return { error: '권한이 없습니다' };

  const revieweeId = isSeller ? post.buyer_id! : post.author_id;

  // Check duplicate
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('post_id', postId)
    .eq('reviewer_id', auth.userId)
    .single();

  if (existing) return { error: '이미 리뷰를 작성했습니다' };

  const { error } = await supabase.from('reviews').insert({
    post_id: postId,
    reviewer_id: auth.userId,
    reviewee_id: revieweeId,
    rating,
    content: content.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/my');
  revalidatePath('/my/reviews');
  return { success: true };
}

export async function getMyReviews() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id(id, nickname, avatar_url),
      post:posts(id, title, type)
    `)
    .eq('reviewee_id', auth.userId)
    .order('created_at', { ascending: false });

  return data ?? [];
}
