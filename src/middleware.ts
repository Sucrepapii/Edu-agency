import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth-jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-please-change-this-in-production-12345';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Retrieve token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If visiting dashboard pages, check authentication
  if (path.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) {
      // If token is invalid or expired, clear and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    const role = payload.role;

    // Root dashboard redirect to role-specific dashboard page
    if (path === '/dashboard') {
      if (role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/super-admin', request.url));
      } else if (role === 'AGENCY_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/agency-admin', request.url));
      } else if (role === 'AGENT') {
        return NextResponse.redirect(new URL('/dashboard/agent', request.url));
      } else if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard/student', request.url));
      }
    }

    // Secure specific route paths based on user role
    if (path.startsWith('/dashboard/super-admin') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (path.startsWith('/dashboard/agency-admin') && role !== 'AGENCY_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (path.startsWith('/dashboard/agent') && role !== 'AGENT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (path.startsWith('/dashboard/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Prevent logged-in users from accessing login/register pages
  if ((path === '/login' || path === '/register') && token) {
    const payload = await verifyJWT(token, JWT_SECRET);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths middleware should apply to
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
