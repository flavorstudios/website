import { adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/role-permissions";

// Use ONE unified collection everywhere in the backend
const COLLECTION = "roles"; // Must match all role code and Firestore structure

export const userRoleStore = {
  /**
   * Gets the user's role from Firestore "roles" collection.
   * Returns UserRole ("admin" | "editor" | "support") if valid, otherwise null.
   * Only returns null if doc missing, invalid, or on error.
   * Now: Normalizes value to lowercase/trimmed for robust checks!
   */
  async get(uid: string): Promise<UserRole | null> {
    try {
      const doc = await adminDb.collection(COLLECTION).doc(uid).get();
      if (!doc.exists) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[userRoleStore] No role document found for UID: ${uid}`);
        }
        return null;
      }

      const data = doc.data();
      // Normalize role for comparison
      const role = data?.role?.toString().trim().toLowerCase();
      if (role === "admin" || role === "editor" || role === "support") {
        return role as UserRole;
      }
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[userRoleStore] Unrecognized role "${data?.role}" (normalized: "${role}") for UID: ${uid}`);
      }
      return null;
    } catch (err) {
      console.error("[userRoleStore.get] Error fetching user role:", err);
      return null;
    }
  },

  /**
   * Sets the user's role in Firestore "roles" collection.
   * Only writes the 'role' field.
   * Now: Always stores lowercase role for consistency.
   */
  async set(uid: string, role: UserRole): Promise<void> {
    try {
      await adminDb.collection(COLLECTION).doc(uid).set({ role: role.toLowerCase() }, { merge: true });
      if (process.env.NODE_ENV !== "production") {
        console.log(`[userRoleStore] Set role "${role.toLowerCase()}" for UID: ${uid}`);
      }
    } catch (err) {
      console.error("[userRoleStore.set] Error setting user role:", err);
      throw err;
    }
  },
};
