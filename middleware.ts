
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    // The API route will verify the session and return the user
    const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      headers: {
        Cookie: `session=${sessionCookie.value}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*',
};
