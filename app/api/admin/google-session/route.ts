// app/api/admin/google-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { requireAdmin, verifyAdminSession } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Centralized logging

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // If user is already authenticated as admin, skip re-login
    if (await requireAdmin(req)) {
      console.log("google-session: User already logged in as admin.");
      return NextResponse.json({ ok: true, message: "Already logged in." });
    }

    const { idToken } = await req.json();

    if (!idToken) {
      logError("google-session: Missing ID token in request.");
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    // --- Verify Firebase ID token with revocation checks ---
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken, true);
      console.log("google-session: ID token verified for email:", decoded.email);
    } catch (err: any) {
      if (err.code === "auth/id-token-revoked") {
        logError("google-session: Token revoked for email", err?.email);
        return NextResponse.json({ error: "Token revoked" }, { status: 401 });
      }
      logError("google-session: verifyIdToken failed", err);
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
    }

    // --- Check admin email authorization securely (server-side only) ---
    try {
      // Use a short-lived session just to verify admin email (never exposed to client)
      const testSessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: 5 * 60 * 1000 });
      await verifyAdminSession(testSessionCookie); // Throws if not allowed
      console.log("google-session: Admin email authorized:", decoded.email);
    } catch (err) {
      logError("google-session: admin email unauthorized", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Determine session expiry (in days) from env ---
    const expiryDaysEnv = parseInt(process.env.ADMIN_SESSION_EXPIRY_DAYS || "1", 10);
    const expiryDays = Number.isNaN(expiryDaysEnv) || expiryDaysEnv <= 0 ? 1 : expiryDaysEnv;
    const expiresIn = 60 * 60 * 24 * expiryDays * 1000; // ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const expiryDate = new Date(Date.now() + expiresIn);

    // Set secure cookie attributes for admin-session
    const res = NextResponse.json({ ok: true, expiresAt: expiryDate.toISOString(), expiryDays });
    res.cookies.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn / 1000, // in seconds
      path: "/",
    });

    // --- LOGGING: Cookie issued for admin ---
    console.log("google-session: Admin session cookie set for", decoded.email);

    // Record login event in Firestore
    try {
      await adminDb.collection("login_events").add({
        email: decoded.email || "",
        timestamp: new Date().toISOString(),
        ip: req.headers.get("x-forwarded-for") || "",
      });
    } catch (logErr) {
      logError("google-session: failed to record login event", logErr);
    }

    return res;
  } catch (err) {
    logError("google-session: final catch", err);
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
  }
}
