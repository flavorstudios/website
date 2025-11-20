import { type NextRequest } from "next/server";

import { serverEnv } from "@/env/server";
import { adminCookieOptions, createSessionCookieFromIdToken } from "@/lib/admin-auth";
import { adminAuth } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { ADMIN_VERIFIED_COOKIE } from "@/shared/admin-cookies";

export async function POST(req: NextRequest) {
  const context = createRequestContext(req);
  try {
    const payload = (await req.json().catch(() => null)) as
      | { idToken?: unknown }
      | null;

    const idToken = typeof payload?.idToken === "string" ? payload.idToken : "";

    if (!idToken) {
      return errorResponse(
        context,
        { error: "Missing ID token." },
        400,
      );
    }

    const expiryDaysEnv = parseInt(serverEnv.ADMIN_SESSION_EXPIRY_DAYS || "1", 10);
    const expiryDays =
      Number.isNaN(expiryDaysEnv) || expiryDaysEnv <= 0 ? 1 : expiryDaysEnv;
    const expiresIn = 60 * 60 * 24 * expiryDays * 1000;

    const [sessionCookie, decodedToken] = await Promise.all([
      createSessionCookieFromIdToken(idToken, expiresIn),
      adminAuth?.verifyIdToken(idToken).catch(() => null),
    ]);

    const emailVerified =
      decodedToken?.email_verified ?? decodedToken?.emailVerified ?? false;

    const response = jsonResponse(context, { ok: true, emailVerified });
    response.cookies.set(
      "admin-session",
      sessionCookie,
      adminCookieOptions({ maxAge: Math.floor(expiresIn / 1000) }),
    );
    response.cookies.set(
      ADMIN_VERIFIED_COOKIE,
      emailVerified ? "true" : "false",
      adminCookieOptions({ maxAge: Math.floor(expiresIn / 1000) }),
    );

    return response;
  } catch (error) {
    logError("admin-email-login", error, { requestId: context.requestId });
    return errorResponse(
      context,
      { error: "Authentication failed." },
      401,
    );
  }
}