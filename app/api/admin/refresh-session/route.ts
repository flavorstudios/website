// app/api/admin/refresh-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, createSessionCookie } from "@/lib/admin-auth";
import { logError } from "@/lib/log";

/**
 * POST /api/admin/refresh-session
 * Checks the current "admin-session" cookie, and if valid, issues a new one with a fresh expiry.
 * Returns 401 if not valid.
 */
export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("admin-session")?.value;
    if (!cookie) {
      return NextResponse.json({ error: "No session." }, { status: 401 });
    }

    // Verify current admin session cookie
    let decoded;
    try {
      decoded = await verifyAdminSession(cookie);
    } catch (error) {
      logError("refresh-session: invalid or expired cookie", error);
      // Clear the cookie
      const res = NextResponse.json({ error: "Session invalid or expired." }, { status: 401 });
      res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
      return res;
    }

    // Set the new expiration (default: 1 day)
    const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day

    // Create a new session cookie
    const newSessionCookie = await createSessionCookie(decoded.uid, expiresIn);

    // Set new cookie
    const res = NextResponse.json({ ok: true, refreshed: true });
    res.cookies.set("admin-session", newSessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    return res;
  } catch (error) {
    logError("refresh-session: final catch", error);
    return NextResponse.json({ error: "Session refresh failed." }, { status: 401 });
  }
}
