import { type NextRequest } from "next/server"

import { serverEnv } from "@/env/server"
import { createRequestContext, jsonResponse } from "@/lib/api/response"
import { ADMIN_VERIFIED_COOKIE } from "@/shared/admin-cookies"

export function GET(req: NextRequest) {
  const context = createRequestContext(req)
  const requiresVerification =
    serverEnv.ADMIN_REQUIRE_EMAIL_VERIFICATION === "true"
  const sessionCookie = req.cookies.get("admin-session")?.value
  const verifiedCookie = req.cookies.get(ADMIN_VERIFIED_COOKIE)?.value
  const serverStateKnown = verifiedCookie === "true" || verifiedCookie === "false"
  const serverVerified = verifiedCookie === "true"

  return jsonResponse(context, {
    requiresVerification,
    authenticated: Boolean(sessionCookie),
    serverVerified,
    serverStateKnown,
  })
}