// lib/admin-auth.ts

import { NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

/**
 * Checks if the request has a valid admin session.
 * Verifies the Firebase session cookie and admin email (from .env).
 * Use this at the top of any protected admin API route.
 */
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  // Retrieve session cookie from request
  const sessionCookie = req.cookies.get("admin-session")?.value
  if (!sessionCookie) return false

  try {
    // Verify session cookie (second arg: true checks revocation)
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)

    // Confirm email matches configured admin (fail safe: only if env is set)
    const adminEmail = process.env.ADMIN_EMAIL || ""
    if (!adminEmail) {
      // Warn in dev, hard fail always
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[admin-auth] ADMIN_EMAIL is not set in environment variables. Admin access will be denied."
        )
      }
      return false
    }
    return decoded.email === adminEmail
  } catch (err) {
    // Any verification error = unauthorized
    return false
  }
}

/**
 * Checks if the current server action context has a valid admin session.
 * Reads the session cookie using next/headers and validates as above.
 * Use this at the start of any server action for defense in depth.
 */
export async function requireAdminAction(): Promise<boolean> {
  const sessionCookie = cookies().get("admin-session")?.value
  if (!sessionCookie) return false

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const adminEmail = process.env.ADMIN_EMAIL || ""
    if (!adminEmail) {
      // Warn in dev, hard fail always
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[admin-auth] ADMIN_EMAIL is not set in environment variables. Admin actions will be denied."
        )
      }
      return false
    }
    return decoded.email === adminEmail
  } catch (err) {
    return false
  }
}
