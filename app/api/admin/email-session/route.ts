import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { logBreadcrumb, logError } from "@/lib/log"
import { serverEnv } from "@/env/server"

import { isEmailAllowed } from "@/lib/admin-allowlist"

export function GET() {
  const bypassEnabled = serverEnv.ADMIN_BYPASS === "true"
  return NextResponse.json({
    mfaRequired: bypassEnabled && Boolean(serverEnv.ADMIN_TOTP_SECRET),
  })
}

export async function POST(req: NextRequest) {
  try {
    if (serverEnv.ADMIN_BYPASS !== "true") {
      logBreadcrumb("legacy-admin-login:blocked")
      return NextResponse.json(
        { error: "Legacy admin login is disabled." },
        { status: 403 }
      )
    }
    const { email, password, otp } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 })
    }
    if (!isEmailAllowed(email)) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
    }
    if (!serverEnv.ADMIN_PASSWORD_HASH || !serverEnv.ADMIN_JWT_SECRET) {
      logError("email-session: missing ADMIN_PASSWORD_HASH or ADMIN_JWT_SECRET", {})
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }
    const hash = serverEnv.ADMIN_PASSWORD_HASH
    const secret = serverEnv.ADMIN_JWT_SECRET
    const passwordMatch = await bcrypt.compare(password, hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
    }
    if (serverEnv.ADMIN_TOTP_SECRET) {
      const { totp } = await import("otplib")
      if (!otp || !totp.check(otp, serverEnv.ADMIN_TOTP_SECRET)) {
        return NextResponse.json({ error: "Invalid 2FA code." }, { status: 401 })
      }
    }
    const token = jwt.sign({ email }, secret, { expiresIn: "1d" })

    const cookieDomain =
      serverEnv.NODE_ENV === "production" ? serverEnv.ADMIN_COOKIE_DOMAIN : undefined
      
    const cookieOptions = {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
      sameSite: "lax" as const, // use "none" with secure: true if you have cross-site flows
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set("admin-session", token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24,
    })
    logBreadcrumb("legacy-admin-login:used", {
      email: typeof email === "string" ? email.toLowerCase() : "unknown",
    })
    return res
  } catch (err) {
    logError("email-session", err)
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
  }
}
