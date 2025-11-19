"use client"

import type { User } from "firebase/auth"

/**
 * Exchanges the current Firebase ID token for a refreshed server session.
 * Returns true when the admin cookies were updated successfully.
 */
export async function syncAdminSession(user: User): Promise<boolean> {
  try {
    const idToken = await user.getIdToken(true)
    const response = await fetch("/api/admin/email-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ idToken }),
    })
    return response.ok
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[syncAdminSession] Failed to refresh admin session", error)
    }
    return false
  }
}