// app/api/admin/google-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getAllowedAdminEmails } from "@/lib/firebase-admin";
import { requireAdmin, verifyAdminSession } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Centralized logging

const debug = process.env.DEBUG_ADMIN === "true" || process.env.NODE_ENV !== "production";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (await requireAdmin(req)) {
      if (debug) {
        console.log("google-session: User already logged in as admin.");
      }
      return NextResponse.json({ ok: true, message: "Already logged in." });
    }

    const { idToken } = await req.json();

    if (!idToken) {
      logError("google-session: Missing ID token in request.", {});
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    // --- Verify Firebase ID token with revocation checks ---
    let decoded;
    const auth = getAdminAuth();
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
        logError("google-session: Token revoked for email", (err as { email?: string })?.email || {});
        return NextResponse.json({ error: "Token revoked" }, { status: 401 });
      }
      logError("google-session: verifyIdToken failed", err);
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
    }

    // --- Log normalized email and allowed admin emails for debug ---
    if (debug) {
      const normalizedLoginEmail = decoded.email?.trim().toLowerCase();
      const allowedAdminEmails = getAllowedAdminEmails();
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
      logError("google-session: admin email unauthorized", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Determine session expiry (in days) from env ---
    const expiryDaysEnv = parseInt(process.env.ADMIN_SESSION_EXPIRY_DAYS || "1", 10);
    const expiryDays = Number.isNaN(expiryDaysEnv) || expiryDaysEnv <= 0 ? 1 : expiryDaysEnv;
    const expiresIn = 60 * 60 * 24 * expiryDays * 1000; // ms
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const expiryDate = new Date(Date.now() + expiresIn);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const, // use "none" with secure: true if you have cross-site flows
      path: "/",
      domain: ".flavorstudios.in",
      };

    // Set secure cookie attributes for admin-session
    const res = NextResponse.json({ ok: true, expiresAt: expiryDate.toISOString(), expiryDays });
    res.cookies.set("admin-session", sessionCookie, {
      ...cookieOptions,
      maxAge: Math.floor(expiresIn / 1000), // seconds
    });

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
      logError("google-session: failed to record login event", logErr);
    }

    return res;
  } catch (err: unknown) {
    logError("google-session: final catch", err);
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
  }
}
