'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createClient } from '@/lib/supabase/server';
import { createToken, setAuthCookie, removeAuthCookie, requireAuth } from '@/lib/auth';

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Check if email already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return { error: '이미 사용 중인 이메일입니다' };
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, password_hash: passwordHash })
    .select('id, email')
    .single();

  if (error || !user) {
    return { error: '회원가입에 실패했습니다' };
  }

  // Create JWT and set cookie
  const token = await createToken({ userId: user.id, email: user.email });
  await setAuthCookie(token);

  redirect('/register/profile');
}

export async function signIn(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Find user
  const { data: user } = await supabase
    .from('users')
    .select('id, email, password_hash')
    .eq('email', email)
    .single();

  if (!user) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다' };
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다' };
  }

  // Create JWT and set cookie
  const token = await createToken({ userId: user.id, email: user.email });
  await setAuthCookie(token);

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, apartment_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.apartment_id) {
    redirect('/register/profile');
  }

  redirect('/home');
}

export async function signOut() {
  await removeAuthCookie();
  redirect('/login');
}

export async function setupProfile(formData: FormData) {
  const auth = await requireAuth();
  const supabase = createClient();

  const nickname = formData.get('nickname') as string;
  const apartmentId = formData.get('apartment_id') as string;

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', auth.userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('profiles')
      .update({
        nickname,
        apartment_id: apartmentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.userId);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: auth.userId,
        nickname,
        apartment_id: apartmentId,
      });

    if (error) {
      return { error: error.message };
    }
  }

  redirect('/home');
}
