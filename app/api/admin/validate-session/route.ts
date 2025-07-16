// app/api/admin/validate-session/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth"; // <-- Use your existing helper

export async function GET() {
  try {
    const sessionCookie = cookies().get("admin-session")?.value;

    if (!sessionCookie) {
      // Missing session cookie (most common reason)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await verifyAdminSession(sessionCookie); // Throws if invalid/expired

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Hardened: NEVER leak error detail to client
    // Optionally log on server for debugging:
    if (process.env.NODE_ENV !== "production") {
      console.error("Admin session validation failed:", err);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
