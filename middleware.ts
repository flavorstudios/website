// middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge middleware: Do NOT import firebase-admin or requireAdmin here!

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page (and variants) for everyone
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?")

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin-session")?.value

    // If accessing the login page and already authenticated, redirect to dashboard
    if (isLoginPage) {
      if (sessionCookie) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      return NextResponse.next()
    }

    // For all other /admin routes, require the cookie
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // All other routes: allow through
  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
