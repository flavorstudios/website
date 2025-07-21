import { adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/role-permissions";

const COLLECTION = "user_roles";

export const userRoleStore = {
  async get(uid: string): Promise<UserRole | null> {
    const doc = await adminDb.collection(COLLECTION).doc(uid).get();
    return doc.exists ? ((doc.data()?.role as UserRole) || null) : null;
  },

  async set(uid: string, role: UserRole): Promise<void> {
    await adminDb.collection(COLLECTION).doc(uid).set({ role });
  },
};
