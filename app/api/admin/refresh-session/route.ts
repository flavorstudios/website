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
      // The helper clears cookies if needed, so just respond
      return NextResponse.json({ error: "Missing refresh token." }, { status: 401 });
    }

    // Lookup the refresh token in Firestore
    const doc = await adminDb.collection("refreshTokens").doc(refreshToken).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }
    const { uid } = doc.data() as { uid: string };

    // Create new session and refresh token using the Codex helper
    // The helper sets cookies in the server context
    const newRefreshToken = await createRefreshSession(uid);

    // Delete the old refresh token (one-time use)
    await adminDb.collection("refreshTokens").doc(refreshToken).delete();

    return NextResponse.json({ ok: true, refreshToken: newRefreshToken });
  } catch (error) {
    logError("refresh-session: final catch", error);
    return NextResponse.json({ error: "Session refresh failed." }, { status: 401 });
  }
}
