// app/api/admin/allowed-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth"; // Helper should verify session and decode email
import { logError } from "@/lib/log"; // Consistent server logging

export async function GET(req: NextRequest) {
  // Retrieve session cookie
  const sessionCookie = cookies().get("admin-session")?.value;
  if (!sessionCookie) {
    console.warn("[allowed-email] No admin-session cookie found");
    return NextResponse.json({ isAllowed: false }, { status: 401 });
  }

  // Decode session to get user email
  let decoded: { email?: string } = {};
  try {
    decoded = await verifyAdminSession(sessionCookie);
    console.log("[allowed-email] Decoded admin session for:", decoded.email);
  } catch (err) {
    logError("allowed-email: verifyAdminSession failed", err);
    return NextResponse.json({ isAllowed: false }, { status: 401 });
  }

  // Gather allowed emails and domain from env
  // Accept both ADMIN_EMAIL and ADMIN_EMAILS for safety
  const singleAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  let adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If single email env var is set, add it to the array (prevents empty checks)
  if (singleAdminEmail && !adminEmails.includes(singleAdminEmail)) {
    adminEmails.push(singleAdminEmail);
  }

  const adminDomain = (process.env.ADMIN_DOMAIN || "").trim().toLowerCase();

  // Check if the user is allowed (email or domain match)
  const userEmail = (decoded.email || "").toLowerCase();
  const isAllowed =
    (userEmail && adminEmails.includes(userEmail)) ||
    (adminDomain && userEmail.endsWith("@" + adminDomain)) ||
    false;

  if (!isAllowed) {
    console.warn("[allowed-email] Admin email not allowed:", userEmail, "| Allowed:", adminEmails, "| Domain:", adminDomain);
  } else {
    console.log("[allowed-email] Admin email allowed:", userEmail);
  }

  // Only return the boolean
  return NextResponse.json({ isAllowed });
}
