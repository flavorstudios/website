import { adminDb } from "@/lib/firebase-admin"
import type { UserRole } from "@/lib/role-permissions"

/**
 * Fetches the user's role from the Firestore 'roles' collection.
 * - Returns the exact role if present and valid.
 * - Returns "support" only if the document is missing or the role is unrecognized.
 * - Logs and rethrows actual network/database errors (does NOT silently downgrade role).
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const doc = await adminDb.collection("roles").doc(uid).get()

    if (!doc.exists) {
      // No role document found, default to 'support'
      return "support"
    }

    const data = doc.data() as { role?: UserRole }

    // Check for valid roles only
    if (data && ["admin", "editor", "support"].includes(data.role || "")) {
      return data.role as UserRole
    }

    // Unrecognized role value; treat as 'support' for safety
    return "support"
  } catch (err) {
    // Only log the error; do NOT default to 'support' on internal/server error
    console.error("Failed to fetch user role:", err)
    throw err
  }
}

/**
 * Sets the user's role in the Firestore 'roles' collection.
 * - Overwrites only the 'role' field (merge: true).
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    await adminDb.collection("roles").doc(uid).set({ role }, { merge: true })
  } catch (err) {
    console.error("Failed to set user role:", err)
    throw err
  }
}
