import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    // Allow access to login page
    if (pathname === "/admin/login") {
      const token = request.cookies.get("admin-session")
      // If already authenticated, redirect to dashboard
      if (token?.value === "authenticated") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      return NextResponse.next()
    }

    // Check authentication for all other admin routes
    const token = request.cookies.get("admin-session")
    if (!token || token.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
