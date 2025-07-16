import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth"; // Secure session verifier

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
    // Never leak internal info in prod!
    if (process.env.NODE_ENV !== "production") {
      console.error("[validate-session] Admin session validation failed:", err);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
