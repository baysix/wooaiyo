import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public auth routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Get JWT from cookie
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromRequest(cookieHeader);
  const user = token ? await verifyToken(token) : null;

  // Unauthenticated user trying to access protected route
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access login/register (but not profile setup)
  if (user && isAuthRoute && pathname !== '/register/profile') {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
