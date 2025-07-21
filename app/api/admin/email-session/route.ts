import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { logError } from "@/lib/log"

function getAllowedAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || ""
  return emails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN || ""
  return domain ? domain.trim().toLowerCase() : null
}

function isEmailAllowed(email: string): boolean {
  if (!email) return false
  const allowedEmails = getAllowedAdminEmails()
  const allowedDomain = getAllowedAdminDomain()
  const normalized = email.trim().toLowerCase()
  if (allowedEmails.length && allowedEmails.includes(normalized)) return true
  if (allowedDomain && normalized.endsWith("@" + allowedDomain)) return true
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, otp } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 })
    }
    if (!isEmailAllowed(email)) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
    }
    const hash = process.env.ADMIN_PASSWORD_HASH
    if (!hash) {
      logError("email-session", "Missing ADMIN_PASSWORD_HASH")
      return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
    const passwordMatch = await bcrypt.compare(password, hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
    }
    if (process.env.ADMIN_TOTP_SECRET) {
      const { totp } = await import("otplib")
      if (!otp || !totp.check(otp, process.env.ADMIN_TOTP_SECRET)) {
        return NextResponse.json({ error: "Invalid 2FA code." }, { status: 401 })
      }
    }
    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) {
      logError("email-session", "Missing ADMIN_JWT_SECRET")
      return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
    const token = jwt.sign({ email }, secret, { expiresIn: "1d" })
    const res = NextResponse.json({ ok: true })
    res.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    })
    return res
  } catch (err) {
    logError("email-session", err)
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
  }
}
