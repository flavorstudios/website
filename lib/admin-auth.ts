// lib/admin-auth.ts

import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * Checks if the request has a valid admin session.
 * Verifies the Firebase session cookie and admin email (from .env).
 * Use this at the top of any protected admin API route.
 */
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  // Retrieve session cookie from request
  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return false;

  try {
    // Verify session cookie (second arg: true checks revocation)
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Confirm email matches configured admin (fail safe: only if env is set)
    const adminEmail = process.env.ADMIN_EMAIL || "";
    if (!adminEmail) {
      // If admin email is missing in env, deny access (hard fail)
      return false;
    }
    return decoded.email === adminEmail;
  } catch (err) {
    // Any verification error = unauthorized
    return false;
  }
}
