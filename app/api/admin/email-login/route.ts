import { NextResponse, type NextRequest } from "next/server"

import { serverEnv } from "@/env/server"
import { createSessionCookieFromIdToken } from "@/lib/admin-auth"
import { logError } from "@/lib/log"

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json().catch(() => null)) as
      | { idToken?: unknown }
      | null

    const idToken = typeof payload?.idToken === "string" ? payload.idToken : ""

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 })
    }

    const expiryDaysEnv = parseInt(serverEnv.ADMIN_SESSION_EXPIRY_DAYS || "1", 10)
    const expiryDays = Number.isNaN(expiryDaysEnv) || expiryDaysEnv <= 0 ? 1 : expiryDaysEnv
    const expiresIn = 60 * 60 * 24 * expiryDays * 1000

    const sessionCookie = await createSessionCookieFromIdToken(idToken, expiresIn)

    const cookieDomain =
      serverEnv.NODE_ENV === "production" ? serverEnv.ADMIN_COOKIE_DOMAIN : undefined

    const response = NextResponse.json({ ok: true })
    response.cookies.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      maxAge: Math.floor(expiresIn / 1000),
    })

    return response
  } catch (error) {
    logError("admin-email-login", error)
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
  }
}