import { adminDb } from "@/lib/firebase-admin"
import type { UserRole } from "@/lib/role-permissions"

/**
 * Fetches the user's role from the Firestore 'roles' collection.
 * - Returns the exact role if present and valid ("admin", "editor", or "support").
 * - Returns "support" if the document is missing or the role is unrecognized.
 * - Logs and rethrows actual network/database errors (does NOT default on error).
 * - Normalizes role to lowercase and trims whitespace for safety.
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const doc = await adminDb.collection("roles").doc(uid).get();

    if (!doc.exists) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[getUserRole] No role document found for UID: ${uid}`);
      }
      return "support";
    }

    const data = doc.data() as { role?: string };

    // Normalize role value: lowercase, trimmed
    const normalizedRole = data?.role?.toString().trim().toLowerCase();

    if (normalizedRole === "admin" || normalizedRole === "editor" || normalizedRole === "support") {
      return normalizedRole as UserRole;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[getUserRole] Unrecognized role value "${data?.role}" (normalized: "${normalizedRole}") for UID: ${uid}`);
    }
    return "support";
  } catch (err) {
    console.error("[getUserRole] Failed to fetch user role:", err);
    throw err;
  }
}

/**
 * Sets the user's role in the Firestore 'roles' collection.
 * - Overwrites only the 'role' field (merge: true).
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    await adminDb.collection("roles").doc(uid).set({ role: role.toLowerCase() }, { merge: true });
    if (process.env.NODE_ENV !== "production") {
      console.log(`[setUserRole] Set role "${role}" for UID: ${uid}`);
    }
  } catch (err) {
    console.error("[setUserRole] Failed to set user role:", err);
    throw err;
  }
}
