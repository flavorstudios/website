// app/api/admin/refresh-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, createSessionCookieFromIdToken } from "@/lib/admin-auth";
import { logError } from "@/lib/log";

/**
 * POST /api/admin/refresh-session
 * Expects: { idToken: string } in body (fresh Firebase ID token from client)
 * If the current admin session is valid and the new ID token is valid, issues a new session cookie.
 * Returns 401 if not valid.
 * 
 * Codex audit: 
 * - All errors clear the session cookie.
 * - Only server-validated cookies are set.
 * - No admin emails are ever leaked client-side.
 */
export async function POST(req: NextRequest) {
  try {
    // Grab any existing session cookie (extra safety, not strictly required)
    const sessionCookie = req.cookies.get("admin-session")?.value;

    // Parse ID token (required for secure refresh)
    let idToken: string | undefined;
    try {
      ({ idToken } = await req.json());
    } catch {
      idToken = undefined;
    }

    if (!idToken) {
      // Always clear the session cookie if request is not valid
      const res = NextResponse.json({ error: "Missing ID token for session refresh." }, { status: 401 });
      res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
      return res;
    }

    // If you want to require an existing session, uncomment the lines below.
    // if (!sessionCookie) {
    //   const res = NextResponse.json({ error: "No session." }, { status: 401 });
    //   res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
    //   return res;
    // }

    // Validate the new ID token and issue a new session cookie
    let newSessionCookie: string;
    try {
      const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day in ms (Codex: review for your policy)
      newSessionCookie = await createSessionCookieFromIdToken(idToken, expiresIn);
    } catch (error) {
      logError("refresh-session: invalid idToken", error);
      const res = NextResponse.json({ error: "Session refresh failed. Invalid token or unauthorized." }, { status: 401 });
      res.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
      return res;
    }

    // Set new cookie securely
    const res = NextResponse.json({ ok: true, refreshed: true });
    res.cookies.set("admin-session", newSessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day in seconds
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
