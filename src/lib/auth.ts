import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
);

const COOKIE_NAME = 'wooaiyo-token';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const auth = await getAuthFromCookie();
  if (!auth) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
    // redirect() throws, this line is unreachable
    throw new Error('Unauthorized');
  }
  return auth;
}

// Role helpers
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

export interface AuthWithRole {
  userId: string;
  email: string;
  role: UserRole;
  apartmentId: string | null;
}

/** Require auth + fetch profile role in one call */
export async function requireAuthWithRole(): Promise<AuthWithRole> {
  const auth = await requireAuth();
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('role, apartment_id')
    .eq('id', auth.userId)
    .single();

  return {
    userId: auth.userId,
    email: auth.email,
    role: (data?.role ?? 'resident') as UserRole,
    apartmentId: data?.apartment_id ?? null,
  };
}

/** Platform admin (all permissions) */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

/** Apartment manager or above */
export function isManager(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

// For middleware (can't use cookies() helper)
export function getTokenFromRequest(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  return match ? match.split('=').slice(1).join('=').trim() : null;
}
