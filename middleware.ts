// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/env/server";
// Node.js-specific admin auth utilities are not imported here because
// middleware runs in the Edge runtime by default. Any sensitive session
// verification should be handled server-side within API routes.

// --- In-memory rate limiter (per Codex) ---
type RateInfo = { count: number; lastAttempt: number };
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_FAILURES = 5;
const rateMap: Map<string, RateInfo> =
  (globalThis as { __adminRateMap?: Map<string, RateInfo> }).__adminRateMap ||
  ((globalThis as { __adminRateMap?: Map<string, RateInfo> }).__adminRateMap = new Map<string, RateInfo>());

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

// --- Helper to get IP address from request (Next.js 13/14 safe) ---
function getRequestIp(request: NextRequest): string {
  // x-forwarded-for could be "clientIP, proxy1, proxy2"
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  return "unknown";
}

export async function middleware(request: NextRequest) {
  // 🔓 Test/CI bypass: allow all when explicitly disabled (Codex suggestion)
  if (serverEnv.ADMIN_AUTH_DISABLED === "1") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const ip = getRequestIp(request);

  // --- PROTECT ALL /api/media ROUTES ---
  if (pathname.startsWith("/api/media")) {
    const sessionCookie = request.cookies.get("admin-session")?.value || "";
    if (!sessionCookie) {
      recordFailure(ip);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    resetRate(ip);
    return NextResponse.next();
  }

  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?");

  // --- All /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin-session")?.value || "";

    // --- Rate limiter: block if too many invalid attempts ---
    if (isRateLimited(ip)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // --- Login page: redirect if and only if session cookie exists ---
    if (isLoginPage) {
      if (sessionCookie) {
        resetRate(ip);
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // --- Protected /admin routes: require a session cookie ---
    if (!sessionCookie) {
      recordFailure(ip);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    resetRate(ip);
  }

  // --- All other routes: allow through ---
  return NextResponse.next();
}

// Multi-admin compatible! Supports ADMIN_EMAILS (comma-separated) and ADMIN_EMAIL (single email).
export const config = {
  matcher: ["/admin/:path*", "/api/media/:path*"],
};