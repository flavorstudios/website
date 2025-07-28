// app/api/admin/refresh-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRefreshSession } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

/**
 * POST /api/admin/refresh-session
 * Expects: { refreshToken: string }
 * Exchanges a valid refresh token for a new short-lived session cookie.
 * Returns 401 if not valid.
 * 
 * Codex audit: 
 * - All errors clear the session cookie.
 * - Only server-validated cookies are set.
 * - No admin emails are ever leaked client-side.
 */
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      const res = NextResponse.json({ error: "Missing refresh token." }, { status: 401 });
      res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
      return res;
    }

    // Lookup the refresh token in Firestore
    const doc = await adminDb.collection("refreshTokens").doc(refreshToken).get();
    if (!doc.exists) {
      const res = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
      res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
      return res;
    }
    const { uid } = doc.data() as { uid: string };

    // Create new session and refresh token using the Codex helper
    const { sessionCookie, refreshToken: newRefreshToken } = await createRefreshSession(uid);

    // Delete the old refresh token (one-time use)
    await adminDb.collection("refreshTokens").doc(refreshToken).delete();

    const res = NextResponse.json({ ok: true, refreshToken: newRefreshToken });
    res.cookies.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });
    return res;
  } catch (error) {
    logError("refresh-session: final catch", error);
    const res = NextResponse.json({ error: "Session refresh failed." }, { status: 401 });
    res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
    return res;
  }
}
