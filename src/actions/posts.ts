'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

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
