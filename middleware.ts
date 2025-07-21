// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { adminAuth } from "@/lib/firebase-admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page (and variants) for everyone
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?");

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin-session")?.value || "";

    // If accessing the login page and already authenticated, redirect to dashboard
    if (isLoginPage) {
      if (sessionCookie) {
        try {
          await verifyAdminSession(sessionCookie);
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } catch (err) {
          // Audit log on failed session attempt at login
          let email: string | null = null;
          try {
            const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
            email = decoded.email || null;
          } catch {}
          await logAdminAuditFailure(email, request.headers.get("x-forwarded-for") ?? "");
        }
      }
      return NextResponse.next();
    }

    // For all other /admin routes, require and validate the cookie
    if (!sessionCookie) {
      await logAdminAuditFailure(null, request.headers.get("x-forwarded-for") ?? "");
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Validate the session cookie directly (no HTTP fetch)
    try {
      await verifyAdminSession(sessionCookie);
    } catch (err) {
      // Audit log on failed validation
      let email: string | null = null;
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        email = decoded.email || null;
      } catch {}
      await logAdminAuditFailure(email, request.headers.get("x-forwarded-for") ?? "");
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // All other routes: allow through
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
  runtime: "nodejs",
};
