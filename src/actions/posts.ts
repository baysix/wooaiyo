'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireAuthWithRole, isAdmin } from '@/lib/auth';
import type { PostStatus } from '@/types/database';

export async function getPostFormData() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('apartment_id')
    .eq('id', auth.userId)
    .single();

  const [catRes, locRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('apartment_locations')
      .select('*')
      .eq('apartment_id', profile?.apartment_id ?? '')
      .order('sort_order'),
  ]);

  return {
    categories: catRes.data ?? [],
    locations: locRes.data ?? [],
    apartmentId: profile?.apartment_id ?? '',
    userId: auth.userId,
  };
}

export async function createPost(formData: FormData, imageUrls: string[]) {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('apartment_id')
    .eq('id', auth.userId)
    .single();

  if (!profile?.apartment_id) {
    return { error: '아파트 설정이 필요합니다' };
  }

  const type = formData.get('type') as string;

  const postData: Record<string, unknown> = {
    author_id: auth.userId,
    apartment_id: profile.apartment_id,
    type,
    title: formData.get('title'),
    description: formData.get('description'),
    category_id: formData.get('category_id') || null,
    location_id: formData.get('location_id') || null,
    images: imageUrls,
  };

  if (type === 'sale') {
    const price = formData.get('price');
    postData.price = price ? Number(price) : null;
    postData.is_negotiable = formData.get('is_negotiable') === 'on';
  } else if (type === 'share') {
    const quantity = formData.get('quantity');
    postData.quantity = quantity ? Number(quantity) : 1;
  } else if (type === 'rental') {
    const deposit = formData.get('deposit');
    const rentalFee = formData.get('rental_fee');
    postData.deposit = deposit ? Number(deposit) : null;
    postData.rental_fee = rentalFee ? Number(rentalFee) : null;
    postData.rental_period = formData.get('rental_period') || null;
  }

  const { error } = await supabase
    .from('posts')
    .insert(postData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function uploadPostImage(file: FormData) {
  const auth = await requireAuth();
  const supabase = createClient();

  const imageFile = file.get('file') as File;
  if (!imageFile) return { error: 'No file provided' };

  const fileName = `${auth.userId}/${Date.now()}_${imageFile.name}`;
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, imageFile);

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

export async function getPost(id: string) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, nickname, avatar_url, manner_score),
      category:categories(id, name, icon),
      location:apartment_locations(id, name)
    `)
    .eq('id', id)
    .single();

  if (!post) return { post: null, isAuthor: false, isAdmin: false };

  return {
    post,
    isAuthor: auth.userId === post.author_id,
    isAdmin: isAdmin(auth.role),
  };
}

export async function updatePost(id: string, formData: FormData, imageUrls: string[]) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single();

  if (!existing || existing.author_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  const type = formData.get('type') as string;

  const updateData: Record<string, unknown> = {
    type,
    title: formData.get('title'),
    description: formData.get('description'),
    category_id: formData.get('category_id') || null,
    location_id: formData.get('location_id') || null,
    images: imageUrls,
    updated_at: new Date().toISOString(),
  };

  if (type === 'sale') {
    const price = formData.get('price');
    updateData.price = price ? Number(price) : null;
    updateData.is_negotiable = formData.get('is_negotiable') === 'on';
  } else if (type === 'share') {
    const quantity = formData.get('quantity');
    updateData.quantity = quantity ? Number(quantity) : 1;
  } else if (type === 'rental') {
    const deposit = formData.get('deposit');
    const rentalFee = formData.get('rental_fee');
    updateData.deposit = deposit ? Number(deposit) : null;
    updateData.rental_fee = rentalFee ? Number(rentalFee) : null;
    updateData.rental_period = formData.get('rental_period') || null;
  }

  const { error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath(`/post/${id}`);
  return { success: true };
}

export async function deletePost(id: string) {
  const auth = await requireAuthWithRole();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single();

  if (!existing) return { error: '글을 찾을 수 없습니다' };

  // Admin can delete any post; otherwise must be author
  if (!isAdmin(auth.role) && existing.author_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  // Soft delete: set status to hidden
  const { error } = await supabase
    .from('posts')
    .update({ status: 'hidden', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

export async function toggleBookmark(postId: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', auth.userId)
    .single();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    const { data: post } = await supabase.from('posts').select('bookmark_count').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ bookmark_count: Math.max(0, (post.bookmark_count || 0) - 1) }).eq('id', postId);
    }
    revalidatePath(`/post/${postId}`);
    return { bookmarked: false };
  } else {
    await supabase.from('bookmarks').insert({ user_id: auth.userId, post_id: postId });
    const { data: post } = await supabase.from('posts').select('bookmark_count').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ bookmark_count: (post.bookmark_count || 0) + 1 }).eq('id', postId);
    }
    revalidatePath(`/post/${postId}`);
    return { bookmarked: true };
  }
}

export async function changePostStatus(postId: string, newStatus: PostStatus, buyerId?: string) {
  const auth = await requireAuth();
  const supabase = createClient();

  // Verify ownership
  const { data: post } = await supabase
    .from('posts')
    .select('author_id, status, type')
    .eq('id', postId)
    .single();

  if (!post || post.author_id !== auth.userId) {
    return { error: '권한이 없습니다' };
  }

  // Call the DB function for validated state transitions
  const { error } = await supabase.rpc('change_post_status', {
    p_post_id: postId,
    p_new_status: newStatus,
    p_user_id: auth.userId,
    p_buyer_id: buyerId ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath(`/post/${postId}`);
  revalidatePath('/chat');
  return { success: true, newStatus };
}

export async function getMyPosts(statusFilter?: PostStatus) {
  const auth = await requireAuth();
  const supabase = createClient();

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, nickname, avatar_url),
      category:categories(id, name, icon)
    `)
    .eq('author_id', auth.userId)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getMyFavorites() {
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (!bookmarks || bookmarks.length === 0) return [];

  const postIds = bookmarks.map(b => b.post_id);

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, nickname, avatar_url),
      category:categories(id, name, icon)
    `)
    .in('id', postIds)
    .neq('status', 'hidden');

  return posts ?? [];
}

export async function getMyTransactions() {
  const auth = await requireAuth();
  const supabase = createClient();

  // Posts I sold (completed)
  const { data: sold } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, nickname, avatar_url),
      buyer:profiles!buyer_id(id, nickname, avatar_url),
      category:categories(id, name, icon)
    `)
    .eq('author_id', auth.userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  // Posts I bought (completed, buyer_id = me)
  const { data: bought } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, nickname, avatar_url),
      buyer:profiles!buyer_id(id, nickname, avatar_url),
      category:categories(id, name, icon)
    `)
    .eq('buyer_id', auth.userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  // Check which posts the user has already reviewed
  const allPostIds = [
    ...(sold ?? []).map(p => p.id),
    ...(bought ?? []).map(p => p.id),
  ];

  let reviewedPostIds: Set<string> = new Set();
  if (allPostIds.length > 0) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('post_id')
      .eq('reviewer_id', auth.userId)
      .in('post_id', allPostIds);

    reviewedPostIds = new Set((reviews ?? []).map(r => r.post_id));
  }

  const addReviewFlag = (posts: typeof sold) =>
    (posts ?? []).map(p => ({ ...p, hasReviewed: reviewedPostIds.has(p.id) }));

  return {
    sold: addReviewFlag(sold),
    bought: addReviewFlag(bought),
  };
}
