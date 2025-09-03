// app/api/admin/validate-session/route.ts

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth"; // Secure session verifier
import { logError } from "@/lib/log"; // Consistent server logging
import { serverEnv } from "@/env/server";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV !== "production";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("api-key");
    if (apiKey !== serverEnv.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Fix: Await cookies() as it's now async in Next.js 14+
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin-session")?.value;

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
