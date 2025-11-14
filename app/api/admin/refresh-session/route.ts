// app/api/admin/refresh-session/route.ts

import { type NextRequest } from "next/server";
import { createRefreshSession } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";
import { createHash } from "crypto";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";

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
  const context = createRequestContext(req);
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      // The helper clears cookies if needed, so just respond
      return errorResponse(context, { error: "Missing refresh token." }, 401);
    }

    const db = getAdminDb();
    // Hash the presented token to compare with stored hashes. This avoids
    // keeping raw tokens in Firestore should it ever be compromised.
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

    // Lookup the refresh token in Firestore by its hash
    const doc = await db.collection("refreshTokens").doc(tokenHash).get();
    if (!doc.exists) {
      return errorResponse(context, { error: "Invalid refresh token" }, 401);
    }
    const { uid } = doc.data() as { uid: string };

    // Create new session and refresh token using the Codex helper
    // The helper sets cookies in the server context
    const newRefreshToken = await createRefreshSession(uid);

    // Delete the old refresh token hash (one-time use)
    await db.collection("refreshTokens").doc(tokenHash).delete();

    return jsonResponse(context, { ok: true, refreshToken: newRefreshToken });
  } catch (error) {
    logError("refresh-session:error", error, { requestId: context.requestId });
    return errorResponse(context, { error: "Session refresh failed." }, 401);
  }
}
