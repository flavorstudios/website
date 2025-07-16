// app/api/admin/allowed-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth"; // You should have a helper to verify the cookie/session

export async function GET(req: NextRequest) {
  // Check for a valid admin session
  const sessionCookie = cookies().get("admin-session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optionally: Further verify session and email server-side
  let decoded: { email?: string } = {};
  try {
    decoded = await verifyAdminSession(sessionCookie);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load allowed emails/domains from env
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  const adminDomain = process.env.ADMIN_DOMAIN?.trim() || "";

  return NextResponse.json({
    allowedEmails: adminEmails,
    allowedDomain: adminDomain,
    yourEmail: decoded.email || null,
    isAllowed:
      (decoded.email && adminEmails.includes(decoded.email)) ||
      (adminDomain && decoded.email?.endsWith("@" + adminDomain)) ||
      false,
  });
}
