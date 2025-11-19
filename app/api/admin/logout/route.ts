// app/api/admin/logout/route.ts

import { type NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { adminCookieOptions, requireAdmin } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Consistent logging
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { ADMIN_VERIFIED_COOKIE } from "@/shared/admin-cookies";

export async function POST(req: NextRequest) {
  const context = createRequestContext(req);
  try {
    // Get the current session cookie
    const sessionCookie = req.cookies.get("admin-session")?.value;

    // If the user is authenticated, revoke their Firebase session (best practice)
    if (sessionCookie && await requireAdmin(req)) {
      const auth = getAdminAuth();
      try {
        const decoded = await auth.verifySessionCookie(sessionCookie, true);
        await auth.revokeRefreshTokens(decoded.uid);
      } catch (err) {
        // If verification fails, just proceed to clear cookie (user is already logged out or token is invalid)
        logError("logout:revokeTokens", err, { requestId: context.requestId });
      }
    }

    // Remove the admin-session cookie
    const res = jsonResponse(context, { ok: true, message: "Logged out" });
    res.cookies.set("admin-session", "", adminCookieOptions({ maxAge: 0 }));
    res.cookies.set("admin-refresh-token", "", adminCookieOptions({ maxAge: 0 }));
    res.cookies.set(ADMIN_VERIFIED_COOKIE, "", adminCookieOptions({ maxAge: 0 }));
    return res;
  } catch (err) {
    logError("logout:error", err, { requestId: context.requestId });
    return errorResponse(
      context,
      { ok: false, message: "Logout failed" },
      500,
    );
  }
}
