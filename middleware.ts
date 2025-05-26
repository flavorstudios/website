import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const token = request.cookies.get("admin-session")
      if (token) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      return NextResponse.next()
    }

    const token = request.cookies.get("admin-session")
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      loginUrl.searchParams.set("message", "Please log in to access the admin dashboard")
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
