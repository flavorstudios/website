// lib/admin-auth.ts

import { NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

/**
 * Checks if the request has a valid admin session (enterprise version).
 * Verifies the Firebase session cookie and admin email.
 * Use this at the top of any protected admin API route.
 */
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get("admin-session")?.value
  if (!sessionCookie) return false

  try {
    // Verify Firebase session cookie
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    // Ensure email matches admin (from env)
    return decoded.email === process.env.ADMIN_EMAIL
  } catch (err) {
    // Invalid, expired, or tampered session
    return false
  }
}
