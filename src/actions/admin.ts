'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuthWithRole, isAdmin } from '@/lib/auth';
import type { UserRole } from '@/types/database';

async function requireAdmin() {
  const auth = await requireAuthWithRole();
  if (!isAdmin(auth.role)) {
    throw new Error('플랫폼 운영자 권한이 필요합니다');
  }
  return auth;
}

export async function getAdminStats() {
  await requireAdmin();
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [usersRes, apartmentsRes, postsRes, todayUsersRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('apartments').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).neq('status', 'hidden'),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalApartments: apartmentsRes.count ?? 0,
    totalPosts: postsRes.count ?? 0,
    todaySignups: todayUsersRes.count ?? 0,
  };
}

export async function getUsers(search?: string, apartmentId?: string, page = 1) {
  await requireAdmin();
  const supabase = createClient();

  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('id, nickname, avatar_url, role, apartment_id, created_at, apartments(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (apartmentId) {
    query = query.eq('apartment_id', apartmentId);
  }

  if (search) {
    query = query.ilike('nickname', `%${search}%`);
  }

  const { data, count } = await query;

  return {
    users: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function changeUserRole(userId: string, newRole: UserRole) {
  const auth = await requireAdmin();
  const supabase = createClient();

  // Prevent changing own role
  if (userId === auth.userId) {
    return { error: '자기 자신의 역할은 변경할 수 없습니다' };
  }

  const validRoles: UserRole[] = ['resident', 'manager', 'admin'];
  if (!validRoles.includes(newRole)) {
    return { error: '잘못된 역할입니다' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function getApartmentsList() {
  await requireAdmin();
  const supabase = createClient();

  const { data: apartments } = await supabase
    .from('apartments')
    .select('*')
    .order('name');

  if (!apartments || apartments.length === 0) return [];

  // Get resident counts and manager counts per apartment
  const aptIds = apartments.map(a => a.id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('apartment_id, role')
    .in('apartment_id', aptIds);

  const stats: Record<string, { residents: number; managers: number }> = {};
  for (const apt of apartments) {
    stats[apt.id] = { residents: 0, managers: 0 };
  }

  if (profiles) {
    for (const p of profiles) {
      if (p.apartment_id && stats[p.apartment_id]) {
        stats[p.apartment_id].residents++;
        if (p.role === 'manager' || p.role === 'admin') {
          stats[p.apartment_id].managers++;
        }
      }
    }
  }

  return apartments.map(apt => ({
    ...apt,
    residentCount: stats[apt.id]?.residents ?? 0,
    managerCount: stats[apt.id]?.managers ?? 0,
  }));
}

export async function createApartment(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;

  if (!name?.trim() || !address?.trim()) {
    return { error: '아파트 이름과 주소를 입력해주세요' };
  }

  const { data, error } = await supabase
    .from('apartments')
    .insert({
      name: name.trim(),
      address: address.trim(),
      city: (formData.get('city') as string)?.trim() || null,
      district: (formData.get('district') as string)?.trim() || null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/apartments');
  return { success: true, id: data.id };
}
