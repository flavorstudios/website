import { adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/role-permissions";

const COLLECTION = "roles"; // Make consistent with other role logic

export const userRoleStore = {
  /**
   * Gets the user's role from Firestore "roles" collection.
   * Returns UserRole ("admin" | "editor" | "support") if valid, otherwise null.
   * Only returns null if doc missing, invalid, or on error.
   */
  async get(uid: string): Promise<UserRole | null> {
    try {
      const doc = await adminDb.collection(COLLECTION).doc(uid).get();
      if (!doc.exists) return null;

      const data = doc.data();
      const role = data?.role;
      if (role === "admin" || role === "editor" || role === "support") {
        return role;
      }
      // Unrecognized role in DB
      return null;
    } catch (err) {
      console.error("userRoleStore.get error:", err);
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
    } catch (err) {
      console.error("userRoleStore.set error:", err);
      throw err;
    }
  },
};
