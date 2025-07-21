import { adminDb } from "@/lib/firebase-admin"
import type { UserRole } from "@/lib/role-permissions"

export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const doc = await adminDb.collection("roles").doc(uid).get()
    const data = doc.exists ? (doc.data() as { role?: UserRole }) : null
    if (data && (data.role === "admin" || data.role === "editor" || data.role === "support")) {
      return data.role
    }
  } catch (err) {
    console.error("Failed to fetch user role:", err)
  }
  return "support"
}

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    await adminDb.collection("roles").doc(uid).set({ role }, { merge: true })
  } catch (err) {
    console.error("Failed to set user role:", err)
    throw err
  }
}
