// app/api/admin/allowed-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth"; // Helper should verify session and decode email
import { logError } from "@/lib/log"; // Consistent server logging

export async function GET(req: NextRequest) {
  // Retrieve session cookie
  const sessionCookie = cookies().get("admin-session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ isAllowed: false }, { status: 401 });
  }

  // Decode session to get user email
  let decoded: { email?: string } = {};
  try {
    decoded = await verifyAdminSession(sessionCookie);
  } catch (err) {
    logError("allowed-email: verifyAdminSession failed", err);
    return NextResponse.json({ isAllowed: false }, { status: 401 });
  }

  // Gather allowed emails and domain from env
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const adminDomain = (process.env.ADMIN_DOMAIN || "").trim();

  // Check if the user is allowed (email or domain match)
  const userEmail = decoded.email || "";
  const isAllowed =
    (userEmail && adminEmails.includes(userEmail)) ||
    (adminDomain && userEmail.endsWith("@" + adminDomain)) ||
    false;

  // Only return the boolean
  return NextResponse.json({ isAllowed });
}
