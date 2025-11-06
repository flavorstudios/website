// app/api/admin/allowed-email/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth"; // Helper should verify session and decode email
import { logError } from "@/lib/log"; // Consistent server logging
import {
  getAllowedAdminEmails,
  getAllowedAdminDomain,
  isAdmin,
} from "@/lib/admin-allowlist";

export async function GET() {
  // Retrieve session cookie
  const cookieStore = await cookies(); // Await here
  const sessionCookie = cookieStore.get("admin-session")?.value;
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

  const userEmail = (decoded.email || "").toLowerCase();
  const adminEmails = getAllowedAdminEmails();
  const adminDomain = getAllowedAdminDomain();
  const isAllowed = isAdmin(userEmail);

  if (!isAllowed) {
    console.warn(
      "[allowed-email] Admin email not allowed:",
      userEmail,
      "| Allowed:",
      adminEmails,
      "| Domain:",
      adminDomain
    );
  } else {
    console.log("[allowed-email] Admin email allowed:", userEmail);
  }

  // Only return the boolean
  return NextResponse.json({ isAllowed });
}
