import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  try {
    // Optional: prevent double login if already authenticated
    if (await requireAdmin(req)) {
      return NextResponse.json({ ok: true, message: "Already logged in." })
    }

    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 })
    }

    // Verify the ID token with Firebase Admin SDK
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Restrict to the configured admin email (from .env)
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || decoded.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // --- CREATE A FIREBASE SESSION COOKIE ---
    // Expires in 7 days (in ms)
    const expiresIn = 60 * 60 * 24 * 7 * 1000
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    // Set secure admin-session cookie
    const res = NextResponse.json({ ok: true })
    res.cookies.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn / 1000, // in seconds
      path: "/",
    })
    return res
  } catch (err) {
    // Log error internally, but send generic error to client
    console.error("[google-session] Auth error:", err)
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
  }
}
