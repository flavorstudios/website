import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 })
    }

    // Verify the token with Firebase Admin SDK
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Restrict to the configured admin email
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || decoded.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Set secure admin-session cookie
    const res = NextResponse.json({ ok: true })
    res.cookies.set("admin-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    return res
  } catch (err) {
    // Log error internally, but send generic error to client
    console.error("[google-session] Auth error:", err)
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
  }
}
