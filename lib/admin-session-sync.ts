"use client"

import type { User } from "firebase/auth"

/**
 * Exchanges the current Firebase ID token for a refreshed server session.
 * Returns true when the admin cookies were updated successfully.
 */
export async function syncAdminSession(
  user: User
): Promise<{ synced: boolean; emailVerified: boolean | null }> {
  try {
    const idToken = await user.getIdToken(true)
    const response = await fetch("/api/admin/email-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ idToken }),
    })
    if (!response.ok) {
      return { synced: false, emailVerified: null }
    }

    const payload = (await response.json().catch(() => null)) as
      | { emailVerified?: boolean }
      | null

    return {
      synced: true,
      emailVerified: typeof payload?.emailVerified === "boolean"
        ? payload.emailVerified
        : null,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[syncAdminSession] Failed to refresh admin session", error)
    }
    return { synced: false, emailVerified: null }
  }
}