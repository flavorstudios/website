// app/api/admin/validate-session/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth"; // <-- Use your existing helper

export async function GET() {
  const sessionCookie = cookies().get("admin-session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyAdminSession(sessionCookie); // Throws if invalid/expired
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
