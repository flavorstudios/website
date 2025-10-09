// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/env/server";
import {
  incrementAttempts,
  isRateLimited,
  resetAttempts,
} from "@/lib/rate-limit";
// Node.js-specific admin auth utilities are not imported here because
// middleware runs in the Edge runtime by default. Any sensitive session
// verification should be handled server-side within API routes.

// --- Helper to get IP address from request (Next.js 13/14 safe) ---
function getRequestIp(request: NextRequest): string {
  // x-forwarded-for could be "clientIP, proxy1, proxy2"
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  return "unknown";
}

export async function middleware(request: NextRequest) {
  const isE2E = process.env.E2E === "true";
  const { pathname } = request.nextUrl;

  if (isE2E && (pathname.startsWith("/admin") || pathname.startsWith("/api/admin"))) {
    return NextResponse.next();
  }

  // 🔓 Test/CI bypass: allow all when explicitly disabled (Codex suggestion)
  if (serverEnv.ADMIN_AUTH_DISABLED === "1") {
    return NextResponse.next();
  }

  const ip = getRequestIp(request);

  const isAdminRequest = pathname.startsWith("/admin");
  const adminHeaders = isAdminRequest ? new Headers(request.headers) : null;
  if (adminHeaders) {
    adminHeaders.set("x-route-type", "admin");
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
      response.headers.set("x-route-type", "admin");
    }
    return response;
  };

  // --- PROTECT ALL /api/media ROUTES ---
  if (pathname.startsWith("/api/media")) {
    const sessionCookie = request.cookies.get("admin-session")?.value || "";
    if (!sessionCookie) {
      await incrementAttempts(ip);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await resetAttempts(ip);
    return NextResponse.next();
  }

  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?");

  // --- All /admin routes
  if (isAdminRequest) {
    const sessionCookie = request.cookies.get("admin-session")?.value || "";
    const isPreviewRoute = pathname.startsWith("/admin/preview");
    const previewToken = request.nextUrl.searchParams.get("token");

    if (isPreviewRoute && previewToken) {
      return nextWithAdminHeaders();
    }

    // --- Rate limiter: block if too many invalid attempts ---
    if (await isRateLimited(ip)) {
      return redirectWithAdminHeaders(new URL("/admin/login", request.url));
    }

    // --- Login page: redirect if and only if session cookie exists ---
    if (isLoginPage) {
      if (sessionCookie) {
        await resetAttempts(ip);
        return redirectWithAdminHeaders(
          new URL("/admin/dashboard", request.url),
        );
      }
      return nextWithAdminHeaders();
    }

    // --- Protected /admin routes: require a session cookie ---
    if (!sessionCookie) {
      await incrementAttempts(ip);
      return redirectWithAdminHeaders(new URL("/admin/login", request.url));
    }

    await resetAttempts(ip);
    return nextWithAdminHeaders();
  }

  // --- All other routes: allow through ---
  return NextResponse.next();
}

// Multi-admin compatible! Supports ADMIN_EMAILS (comma-separated) and ADMIN_EMAIL (single email).
export const config = {
  matcher: ["/admin/:path*", "/api/media/:path*"],
};