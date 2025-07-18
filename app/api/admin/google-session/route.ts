// app/api/admin/google-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { requireAdmin, verifyAdminSession } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Centralized logging

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // If user is already authenticated as admin, skip re-login
    if (await requireAdmin(req)) {
      return NextResponse.json({ ok: true, message: "Already logged in." });
    }

    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    // --- Verify Firebase ID token with revocation checks ---
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

    // --- Check admin email authorization securely (server-side only) ---
    try {
      // Use a short-lived session just to verify admin email (never exposed to client)
      const testSessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: 5 * 60 * 1000 });
      await verifyAdminSession(testSessionCookie); // Throws if not allowed
    } catch (err) {
      logError("google-session: admin email unauthorized", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Create a Firebase session cookie for admin, valid 1 day ---
    const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day in ms (audit: review for your policy)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set secure cookie attributes for admin-session
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
