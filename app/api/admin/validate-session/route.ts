// app/api/admin/validate-session/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth"; // Secure session verifier
import { logError } from "@/lib/log"; // Consistent server logging

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = process.env.DEBUG_ADMIN === "true" || process.env.NODE_ENV !== "production";

export async function GET() {
  try {
    const sessionCookie = cookies().get("admin-session")?.value;

    if (!sessionCookie) {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log("[validate-session] No admin-session cookie found");
      }
      // Most common reason: missing session
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = await verifyAdminSession(sessionCookie); // Throws if expired/invalid/unauthorized

    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[validate-session] Session validated for email:", verified?.email);
      // eslint-disable-next-line no-console
      console.log("[validate-session] User role:", verified?.role);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("validate-session", err);
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[validate-session] Session validation failed:", err);
    }
    // Never leak internal info in prod!
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
