// app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Consistent logging

export async function POST(req: NextRequest) {
  try {
    // Get the current session cookie
    const sessionCookie = req.cookies.get("admin-session")?.value;

    // If the user is authenticated, revoke their Firebase session (best practice)
    if (sessionCookie && await requireAdmin(req)) {
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        await adminAuth.revokeRefreshTokens(decoded.uid);
      } catch (err) {
        // If verification fails, just proceed to clear cookie (user is already logged out or token is invalid)
        logError("logout: revokeTokens verification failed", err);
      }
    }

    // Remove the admin-session cookie
    const res = NextResponse.json({ ok: true, message: "Logged out" });
    res.cookies.set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
