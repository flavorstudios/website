// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serverEnv } from '@/env/server';
import { isE2EEnabled } from '@/lib/e2e-utils';
import {
  incrementAttempts,
  isRateLimited,
  resetAttempts,
} from '@/lib/rate-limit';
import { ADMIN_VERIFIED_COOKIE } from '@/shared/admin-cookies';

function getRequestIp(request: NextRequest): string {
  const xfwd = request.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0].trim();
  return 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isE2E = isE2EEnabled();
  const requiresEmailVerification =
    serverEnv.ADMIN_REQUIRE_EMAIL_VERIFICATION === 'true';

  // E2E: Bypass auth for admin routes. CI runs behind arbitrary hostnames,
  // so avoid depending on localhost or a special cookie.
  if (isE2E && (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))) {
    const response = NextResponse.next();
    response.headers.set('X-E2E-Authenticated', 'true');
    return response;
  }

  // The rest of the original middleware...
  // 🔓 Test/CI bypass: allow all when explicitly disabled
  if (serverEnv.ADMIN_AUTH_DISABLED === '1') {
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
    const isVerifyRoute =
    pathname === '/admin/verify-email' ||
    pathname === '/admin/verify-email/' ||
    pathname.startsWith('/admin/verify-email?');
  const isSignupPage =
    pathname === '/admin/signup' ||
    pathname === '/admin/signup/' ||
    pathname.startsWith('/admin/signup?');
  const isForgotPasswordPage =
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/forgot-password/' ||
    pathname.startsWith('/admin/forgot-password?');

  // --- All /admin routes
  if (isAdminRequest) {
    const sessionCookie = request.cookies.get('admin-session')?.value || '';
    const isPreviewRoute = pathname.startsWith('/admin/preview');
    const previewToken = request.nextUrl.searchParams.get('token');
    const verifiedCookie = request.cookies.get(ADMIN_VERIFIED_COOKIE)?.value;
    const knownVerified = verifiedCookie === 'true';
    const knownUnverified = verifiedCookie === 'false';

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
        if (requiresEmailVerification && knownUnverified) {
          return redirectWithAdminHeaders(
            new URL('/admin/verify-email', request.url),
          );
        }
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

    if (
      requiresEmailVerification &&
      knownUnverified &&
      !isVerifyRoute &&
      !isPreviewRoute &&
      !isSignupPage &&
      !isForgotPasswordPage
    ) {
      return redirectWithAdminHeaders(
        new URL('/admin/verify-email', request.url),
      );
    }

    if (
      requiresEmailVerification &&
      knownVerified &&
      isVerifyRoute
    ) {
      return redirectWithAdminHeaders(
        new URL('/admin/dashboard', request.url),
      );
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
