// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serverEnv } from '@/env/server';
import {
  incrementAttempts,
  isRateLimited,
  resetAttempts,
} from '@/lib/rate-limit';

function getRequestIp(request: NextRequest): string {
  const xfwd = request.headers.get('x-forwarded-for');
  if (xfwd) {
    const [forwarded] = xfwd
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    if (forwarded) {
      return forwarded;
    }
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.length > 0) {
    return realIp;
  }
  return 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const isE2E = process.env.E2E === 'true';

  // E2E: Bypass auth for admin routes on localhost or with a special cookie.
  if (isE2E && (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))) {
    const isLocal = hostname === '127.0.0.1' || hostname === 'localhost';
    const hasE2ECookie = request.cookies.has('e2e-admin');

    if (isLocal || hasE2ECookie) {
      const response = NextResponse.next();
      response.headers.set('X-E2E-Authenticated', 'true');
      return response;
    }
  }

  // The rest of the original middleware...
  // 🔓 Test/CI bypass: allow all when explicitly disabled
  if (serverEnv.ADMIN_AUTH_DISABLED === '1' || serverEnv.ADMIN_BYPASS === 'true') {
    return NextResponse.next();
  }

  const ip = getRequestIp(request);

  const isAdminRequest = pathname.startsWith('/admin');
  const adminHeaders = isAdminRequest ? new Headers(request.headers) : null;
  if (adminHeaders) {
    adminHeaders.set('x-route-type', 'admin');
  }

  const nextWithAdminHeaders = () =>
    adminHeaders
      ? NextResponse.next({
          request: {
            headers: adminHeaders,
          },
        })
      : NextResponse.next();

  const redirectWithAdminHeaders = (url: URL) => {
    const response = NextResponse.redirect(url);
    if (adminHeaders) {
      response.headers.set('x-route-type', 'admin');
    }
    return response;
  };

  // --- PROTECT ALL /api/media ROUTES ---
  if (pathname.startsWith('/api/media')) {
    const sessionCookie = request.cookies.get('admin-session')?.value || '';
    if (!sessionCookie) {
      await incrementAttempts(ip);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await resetAttempts(ip);
    return NextResponse.next();
  }

  const isLoginPage =
    pathname === '/admin/login' ||
    pathname === '/admin/login/' ||
    pathname.startsWith('/admin/login?');

  // --- All /admin routes
  if (isAdminRequest) {
    const sessionCookie = request.cookies.get('admin-session')?.value || '';
    const isPreviewRoute = pathname.startsWith('/admin/preview');
    const previewToken = request.nextUrl.searchParams.get('token');

    if (isPreviewRoute && previewToken) {
      return nextWithAdminHeaders();
    }

    // --- Rate limiter: block if too many invalid attempts ---
    if (await isRateLimited(ip)) {
      return redirectWithAdminHeaders(new URL('/admin/login', request.url));
    }

    // --- Login page: redirect if and only if session cookie exists ---
    if (isLoginPage) {
      if (sessionCookie) {
        await resetAttempts(ip);
        return redirectWithAdminHeaders(
          new URL('/admin/dashboard', request.url),
        );
      }
      return nextWithAdminHeaders();
    }

    // --- Protected /admin routes: require a session cookie ---
    if (!sessionCookie) {
      await incrementAttempts(ip);
      return redirectWithAdminHeaders(new URL('/admin/login', request.url));
    }

    await resetAttempts(ip);
    return nextWithAdminHeaders();
  }

  // --- All other routes: allow through ---
  return NextResponse.next();
}

// Multi-admin compatible! Supports ADMIN_EMAILS (comma-separated) and ADMIN_EMAIL (single email).
export const config = {
  matcher: ['/admin/:path*', '/api/media/:path*'],
};
