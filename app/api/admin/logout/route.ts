// app/api/admin/logout/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Consistent logging
import { serverEnv } from "@/env/server";

export async function POST(req: NextRequest) {
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
        logError("logout: revokeTokens verification failed", err);
      }
    }

    // Remove the admin-session cookie
    const res = NextResponse.json({ ok: true, message: "Logged out" });
    res.cookies.set("admin-session", "", {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return res;
  } catch (err) {
    logError("logout: final catch", err);
    return NextResponse.json({ ok: false, message: "Logout failed" }, { status: 500 });
  }
}
