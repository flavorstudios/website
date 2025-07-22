// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { adminAuth } from "@/lib/firebase-admin";

// --- In-memory rate limiter (per Codex) ---
type RateInfo = { count: number; lastAttempt: number };
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_FAILURES = 5;
const rateMap: Map<string, RateInfo> =
  // @ts-ignore
  (globalThis as any).__adminRateMap ||
  // @ts-ignore
  ((globalThis as any).__adminRateMap = new Map<string, RateInfo>());

function recordFailure(ip: string) {
  const now = Date.now();
  const info = rateMap.get(ip);
  if (!info || now - info.lastAttempt > RATE_LIMIT_WINDOW) {
    rateMap.set(ip, { count: 1, lastAttempt: now });
    return 1;
  }
  info.count += 1;
  info.lastAttempt = now;
  rateMap.set(ip, info);
  return info.count;
}

function isRateLimited(ip: string): boolean {
  const info = rateMap.get(ip);
  if (!info) return false;
  if (Date.now() - info.lastAttempt > RATE_LIMIT_WINDOW) {
    rateMap.delete(ip);
    return false;
  }
  return info.count > MAX_FAILURES;
}

function resetRate(ip: string) {
  rateMap.delete(ip);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?");

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin-session")?.value || "";

    // --- Rate limiter: block if too many invalid attempts ---
    if (isRateLimited(ip)) {
      await logAdminAuditFailure(null, ip, "rate_limited");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // --- Login page: redirect if and only if valid session exists ---
    if (isLoginPage) {
      if (sessionCookie) {
        try {
          // If the session is valid, skip login and go to dashboard
          await verifyAdminSession(sessionCookie);
          resetRate(ip);
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } catch (err) {
          // Session cookie invalid or expired, let user log in again
          let email: string | null = null;
          try {
            const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
            email = decoded.email || null;
          } catch {}
          recordFailure(ip);
          await logAdminAuditFailure(email, ip, "invalid_session_login");

          // --- DEV ONLY: Extra debug for allowlist failures
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.log(`[Admin Middleware] Invalid session for email: ${email}. Possible allowlist mismatch. Check ADMIN_EMAILS/ADMIN_EMAIL env.`);
          }
        }
      }
      // No session or invalid: stay on login
      return NextResponse.next();
    }

    // --- Protected /admin routes: require a valid session cookie ---
    if (!sessionCookie) {
      recordFailure(ip);
      await logAdminAuditFailure(null, ip, "missing_session");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // If the session is valid, proceed to admin route
      await verifyAdminSession(sessionCookie);
      resetRate(ip);
    } catch (err) {
      // Session invalid or expired, redirect to login
      let email: string | null = null;
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        email = decoded.email || null;
      } catch {}
      recordFailure(ip);
      await logAdminAuditFailure(email, ip, "invalid_session_route");

      // --- DEV ONLY: Extra debug for allowlist failures
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(`[Admin Middleware] Unauthorized session for email: ${email}. Check allowlist in ADMIN_EMAILS/ADMIN_EMAIL.`);
      }

      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // --- All other routes: allow through ---
  return NextResponse.next();
}

// Multi-admin compatible! Supports ADMIN_EMAILS (comma-separated) and ADMIN_EMAIL (single email).
export const config = {
  matcher: "/admin/:path*",
  runtime: "nodejs",
};
