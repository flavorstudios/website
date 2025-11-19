// app/api/admin/google-session/route.ts

import { type NextRequest } from "next/server";
import { getAdminAuth, getAdminDb, getAllowedAdminEmails } from "@/lib/firebase-admin";
import { adminCookieOptions, requireAdmin, verifyAdminSession } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Centralized logging
import { serverEnv } from "@/env/server";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { ADMIN_VERIFIED_COOKIE } from "@/shared/admin-cookies";

const debug = serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV !== "production";

export async function POST(req: NextRequest) {
  const context = createRequestContext(req);
  try {
    if (await requireAdmin(req)) {
      if (debug) {
        console.log("google-session: User already logged in as admin.");
      }
      return jsonResponse(context, { ok: true, message: "Already logged in." });
    }

    const { idToken } = await req.json();

    if (!idToken) {
      logError("google-session:missing-id-token", undefined, {
        requestId: context.requestId,
      });
      return errorResponse(context, { error: "Missing ID token." }, 400);
    }

    // --- Verify Firebase ID token with revocation checks ---
    let decoded: any;
    let auth: ReturnType<typeof getAdminAuth>;
    try {
      auth = getAdminAuth();
    } catch (err) {
      logError("google-session:admin-sdk", err, { requestId: context.requestId });
      const message =
        err instanceof Error
          ? err.message
          : "FIREBASE_SERVICE_ACCOUNT_KEY missing or invalid";
      return errorResponse(context, { error: message }, 500);
    }
    try {
      decoded = await auth.verifyIdToken(idToken, true);
      if (debug) {
        console.log("google-session: ID token verified for email:", decoded.email);
      }
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "auth/id-token-revoked"
      ) {
        logError(
          "google-session:token-revoked",
          err,
          { requestId: context.requestId },
        );
        return errorResponse(context, { error: "Token revoked" }, 401);
      }
      logError("google-session:verify-id-token", err, {
        requestId: context.requestId,
      });
      return errorResponse(context, { error: "Authentication failed." }, 401);
    }

    // --- NEW: log raw admin email envs before building the allowlist ---
    if (debug) {
      console.log("[google-session] ADMIN_EMAILS raw:", serverEnv.ADMIN_EMAILS);
      console.log("[google-session] ADMIN_EMAIL raw:", serverEnv.ADMIN_EMAIL);
    }

    const allowedAdminEmails = getAllowedAdminEmails();
    if (allowedAdminEmails.length === 0) {
      const message = "No admin emails configured";
      // Ensure we fail fast even when DEBUG_ADMIN is enabled
      logError(`google-session:${message}`, undefined, {
        requestId: context.requestId,
      });
      return errorResponse(context, { error: message }, 500);
    }

    // --- Log normalized email and allowed admin emails for debug ---
    if (debug) {
      const normalizedLoginEmail = decoded.email?.trim().toLowerCase();
      console.log("[google-session] Normalized login email:", `"${normalizedLoginEmail}"`);
      console.log("[google-session] Allowed admin emails:", allowedAdminEmails.map(e => `"${e}"`));
    }

    // --- Check admin email authorization securely (server-side only) ---
    try {
      const testSessionCookie = await auth.createSessionCookie(idToken, { expiresIn: 5 * 60 * 1000 });
      await verifyAdminSession(testSessionCookie); // Throws if not allowed
      if (debug) {
        console.log("google-session: Admin email authorized:", decoded.email);
      }
    } catch (err: unknown) {
      logError("google-session:unauthorized-email", err, {
        requestId: context.requestId,
      });
      console.warn("[Auth] Denied Google sign-in for", decoded.email);
      if (err instanceof Error && err.message === "Unauthorized admin email") {
        return errorResponse(context, { error: "Email not on admin list" }, 401);
      }
      return errorResponse(context, { error: "Authentication failed." }, 500);
    }

    // --- Determine session expiry (in days) from env ---
    const expiryDaysEnv = parseInt(serverEnv.ADMIN_SESSION_EXPIRY_DAYS || "1", 10);
    const expiryDays = Number.isNaN(expiryDaysEnv) || expiryDaysEnv <= 0 ? 1 : expiryDaysEnv;
    const expiresIn = 60 * 60 * 24 * expiryDays * 1000; // ms
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const expiryDate = new Date(Date.now() + expiresIn);

    // Set secure cookie attributes for admin-session
    const res = jsonResponse(context, {
      ok: true,
      expiresAt: expiryDate.toISOString(),
      expiryDays,
    });
    res.cookies.set(
      "admin-session",
      sessionCookie,
      adminCookieOptions({ maxAge: Math.floor(expiresIn / 1000) }),
    );
    res.cookies.set(
      ADMIN_VERIFIED_COOKIE,
      "true",
      adminCookieOptions({ maxAge: Math.floor(expiresIn / 1000) }),
    );

    // --- LOGGING: Cookie issued for admin ---
    if (debug) {
      console.log("google-session: Admin session cookie set for", decoded.email);
    }

    // Record login event in Firestore
    try {
      const db = getAdminDb();
      await db.collection("login_events").add({
        email: decoded.email || "",
        timestamp: new Date().toISOString(),
        ip: req.headers.get("x-forwarded-for") || "",
      });
    } catch (logErr: unknown) {
      logError("google-session:login-event", logErr, {
        requestId: context.requestId,
      });
    }

    return res;
  } catch (err: unknown) {
    logError("google-session:error", err, { requestId: context.requestId });
    return errorResponse(context, { error: "Authentication failed." }, 500);
  }
}
