import { type NextRequest } from "next/server"

import { serverEnv } from "@/env/server"
import { createRequestContext, jsonResponse } from "@/lib/api/response"
import { adminCookieOptions, verifyAdminSession } from "@/lib/admin-auth"
import { ADMIN_VERIFIED_COOKIE } from "@/shared/admin-cookies"

export async function GET(req: NextRequest) {
  const context = createRequestContext(req)
  const requiresVerification =
    serverEnv.ADMIN_REQUIRE_EMAIL_VERIFICATION === "true"
  const sessionCookie = req.cookies.get("admin-session")?.value
  const verifiedCookie = req.cookies.get(ADMIN_VERIFIED_COOKIE)?.value

  // Default to "unknown" until we can validate the session cookie.
  let serverVerified = verifiedCookie === "true"
  let serverStateKnown =
    verifiedCookie === "true" || verifiedCookie === "false"

  if (sessionCookie) {
    try {
      const decoded = await verifyAdminSession(sessionCookie)
      const emailVerified =
        (decoded as { email_verified?: boolean }).email_verified ??
        (decoded as { emailVerified?: boolean }).emailVerified ??
        false
      serverVerified = !requiresVerification || Boolean(emailVerified)
      serverStateKnown = true
    } catch {
      // If verification fails, fall back to any cookie hint and mark unknown
      serverVerified = verifiedCookie === "true"
      serverStateKnown = verifiedCookie === "true" || verifiedCookie === "false"
    }
  }

  const response = jsonResponse(context, {
    requiresVerification,
    authenticated: Boolean(sessionCookie),
    serverVerified,
    serverStateKnown,
  })

  // Refresh the verification cookie so middleware and the client agree on state.
  if (serverStateKnown) {
    response.cookies.set(
      ADMIN_VERIFIED_COOKIE,
      serverVerified ? "true" : "false",
      adminCookieOptions({ maxAge: 60 * 60 * 2 })
    )
  }

  return response
}