// app/api/admin/google-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { requireAdmin, verifyAdminSession } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // NEW: Consistent logging helper

export async function POST(req: NextRequest) {
  try {
    // Prevent double login if already authenticated
    if (await requireAdmin(req)) {
      return NextResponse.json({ ok: true, message: "Already logged in." });
    }

    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    // --- VERIFY THE ID TOKEN WITH REVOCATION CHECK ---
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken, true);
    } catch (err: any) {
      if (err.code === "auth/id-token-revoked") {
        return NextResponse.json({ error: "Token revoked" }, { status: 401 });
      }
      logError("google-session: verifyIdToken", err);
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
    }

    // --- Securely check: Is this an allowed admin email? ---
    try {
      // Use a short session just to check permissions
      const testSessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: 5 * 60 * 1000 });
      await verifyAdminSession(testSessionCookie); // Throws if not allowed (uses email normalization)
    } catch (err) {
      logError("google-session: admin email unauthorized", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- CREATE A FIREBASE SESSION COOKIE ---
    const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day (was 7 days)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set secure admin-session cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn / 1000, // in seconds
      path: "/",
    });
    return res;
  } catch (err) {
    logError("google-session: final catch", err);
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
  }
}
