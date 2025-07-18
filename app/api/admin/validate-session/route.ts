// app/api/admin/validate-session/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth"; // Secure session verifier
import { logError } from "@/lib/log"; // Consistent server logging

export async function GET() {
  try {
    const sessionCookie = cookies().get("admin-session")?.value;

    if (!sessionCookie) {
      // Most common reason: missing session
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await verifyAdminSession(sessionCookie); // Throws if expired/invalid/unauthorized

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("validate-session", err);
    // Never leak internal info in prod!
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
