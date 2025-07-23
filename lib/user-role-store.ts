import { adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/role-permissions";

// Use ONE unified collection everywhere in the backend
const COLLECTION = "roles"; // Must match all role code and Firestore structure

export const userRoleStore = {
  /**
   * Gets the user's role from Firestore "roles" collection.
   * Returns UserRole ("admin" | "editor" | "support") if valid, otherwise null.
   * Only returns null if doc missing, invalid, or on error.
   */
  async get(uid: string): Promise<UserRole | null> {
    try {
      const doc = await adminDb.collection(COLLECTION).doc(uid).get();
      if (!doc.exists) {
        console.warn(`[userRoleStore] No role document found for UID: ${uid}`);
        return null;
      }

      const data = doc.data();
      const role = data?.role;
      if (role === "admin" || role === "editor" || role === "support") {
        return role;
      }
      // Unrecognized role in DB
      console.warn(`[userRoleStore] Unrecognized role "${role}" for UID: ${uid}`);
      return null;
    } catch (err) {
      console.error("[userRoleStore.get] Error fetching user role:", err);
      return null;
    }
  },

  /**
   * Sets the user's role in Firestore "roles" collection.
   * Only writes the 'role' field.
   */
  async set(uid: string, role: UserRole): Promise<void> {
    try {
      await adminDb.collection(COLLECTION).doc(uid).set({ role }, { merge: true });
      console.log(`[userRoleStore] Set role "${role}" for UID: ${uid}`);
    } catch (err) {
      console.error("[userRoleStore.set] Error setting user role:", err);
      throw err;
    }
  },
};
