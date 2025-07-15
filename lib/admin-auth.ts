// lib/admin-auth.ts

import { NextRequest } from "next/server"

/**
 * Checks if the request has a valid admin session.
 * Returns true if the "admin-session" cookie is set and matches the expected value.
 * Use this at the top of any protected admin API route.
 */
export function requireAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin-session")
  return token?.value === "authenticated"
}
