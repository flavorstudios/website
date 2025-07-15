import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Normalize admin login path (allow trailing slash and query) ---
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/login?")

  // --- Only apply to /admin routes ---
  if (pathname.startsWith("/admin")) {
    // Allow access to login page (all variants)
    if (isLoginPage) {
      // If already authenticated, redirect to dashboard
      if (await requireAdmin(request)) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      return NextResponse.next()
    }

    // For all other admin routes, require authentication (async)
    if (!(await requireAdmin(request))) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow all other routes
  return NextResponse.next()
}

// Protect all /admin routes
export const config = {
  matcher: "/admin/:path*",
}
