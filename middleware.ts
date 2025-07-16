// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page (and variants) for everyone
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?");

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin-session")?.value;

    // If accessing the login page and already authenticated, redirect to dashboard
    if (isLoginPage) {
      if (sessionCookie) {
        try {
          const apiResp = await fetch(`${request.nextUrl.origin}/api/admin/validate-session`, {
            method: "GET",
            headers: { cookie: `admin-session=${sessionCookie}` },
          });
          if (apiResp.ok) {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
          }
        } catch (err) {
          // Hardened: If the API is down or throws, don't block the login page—just allow access to login
          if (process.env.NODE_ENV !== "production") {
            console.error("Admin session validation (login) failed:", err);
          }
        }
      }
      return NextResponse.next();
    }

    // For all other /admin routes, require and validate the cookie
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Validate the session cookie with backend API
    try {
      const apiResp = await fetch(`${request.nextUrl.origin}/api/admin/validate-session`, {
        method: "GET",
        headers: { cookie: `admin-session=${sessionCookie}` },
      });

      if (!apiResp.ok) {
        // Cookie is missing, expired, or invalid—redirect to login
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      // Hardened: If the API is down or throws, redirect to login instead of erroring out
      if (process.env.NODE_ENV !== "production") {
        console.error("Admin session validation (route) failed:", err);
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // All other routes: allow through
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
