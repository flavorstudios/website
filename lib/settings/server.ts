import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { createHash } from "crypto"
import type { Firestore } from "firebase-admin/firestore"

import { DEFAULT_USER_SETTINGS, mergeSettings } from "./common"
import {
  userSettingsSchema,
  type UserSettings,
} from "@/lib/schemas/settings"

export * from "./common"

function isArrayBuffer(input: ArrayBuffer | Uint8Array): input is ArrayBuffer {
  return (
    input instanceof ArrayBuffer ||
    Object.prototype.toString.call(input) === "[object ArrayBuffer]"
  )
}

function toBuffer(input: ArrayBuffer | Uint8Array): Buffer {
  if (isArrayBuffer(input)) {
    return Buffer.from(input)
  }
  return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
}

export async function hashAvatar(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const hash = createHash("sha1")
  hash.update(toBuffer(buffer))
  return hash.digest("hex")
}

export const getSettingsDocRef = cache((db: Firestore, uid: string) => {
  return db.collection("users").doc(uid).collection("settings").doc("general")
})

export async function getCurrentAdminUid(): Promise<string> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin-session")?.value
  if (!sessionCookie) throw new Error("Missing admin session")
  const { verifyAdminSession } = await import("@/lib/admin-auth")
  const session = await verifyAdminSession(sessionCookie)
  if (!session?.uid) throw new Error("Missing admin uid")
  return session.uid as string
}

export async function readUserSettings(db: Firestore, uid: string): Promise<UserSettings | null> {
  const doc = await getSettingsDocRef(db, uid).get()
  if (!doc.exists) return null
  const data = doc.data() as UserSettings
  try {
    return userSettingsSchema.parse(data)
  } catch {
    return {
      ...DEFAULT_USER_SETTINGS,
      ...data,
    } as UserSettings
  }
}

export async function writeUserSettings(
  db: Firestore,
  uid: string,
  updates: Partial<UserSettings>,
): Promise<UserSettings> {
  const docRef = getSettingsDocRef(db, uid)
  return await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef)
    const current = snapshot.exists ? (snapshot.data() as UserSettings) : null
    const merged = mergeSettings(current, updates)
    tx.set(docRef, merged, { merge: true })
    return merged
  })
}