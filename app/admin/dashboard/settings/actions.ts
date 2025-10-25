'use server'

import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { requireAdminAction } from "@/lib/admin-auth"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"
import {
  appearanceSettingsSchema,
  changeEmailSchema,
  notificationsSettingsSchema,
  profileSettingsSchema,
  sendVerificationSchema,
  type AppearanceSettingsInput,
  type NotificationsSettingsInput,
  type ProfileSettingsInput,
  type UserSettings,
} from "@/lib/schemas/settings"
import {
  DEFAULT_APPEARANCE,
  getContrastRatio,
  getCurrentAdminUid,
  readUserSettings,
  writeUserSettings,
} from "@/lib/settings/server"

const rollbackStore = new Map<
  string,
  { previous: UserSettings; expiresAt: number; uid: string }
>()

const ACTION_PATH = "/admin/dashboard/settings"

async function ensureAdmin(): Promise<string> {
  if (!(await requireAdminAction())) {
    throw new Error("Unauthorized")
  }
  return await getCurrentAdminUid()
}

export async function loadSettings(): Promise<UserSettings> {
  const uid = await ensureAdmin()
  const db = getAdminDb()
  if (!db) throw new Error("Admin database unavailable")
  const settings = await readUserSettings(db, uid)
  if (settings) return settings
  await writeUserSettings(db, uid, {})
  const fresh = await readUserSettings(db, uid)
  if (!fresh) throw new Error("Failed to initialize settings")
  return fresh
}

function createRollback(uid: string, previous: UserSettings): string {
  const token = randomUUID()
  rollbackStore.set(token, { previous, uid, expiresAt: Date.now() + 1000 * 60 * 5 })
  return token
}

async function persistUpdates(
  uid: string,
  updates: Partial<UserSettings>,
): Promise<{ settings: UserSettings; rollbackToken: string }> {
  const db = getAdminDb()
  if (!db) throw new Error("Admin database unavailable")
  const current = await readUserSettings(db, uid)
  const settings = await writeUserSettings(db, uid, updates)
  const rollbackToken = createRollback(uid, current ?? settings)
  revalidatePath(ACTION_PATH)
  return { settings, rollbackToken }
}

export async function updateProfile(input: ProfileSettingsInput) {
  const uid = await ensureAdmin()
  const parsed = profileSettingsSchema.parse(input)
  return await persistUpdates(uid, { profile: parsed })
}

const changeEmailCooldown = new Map<string, number>()
const verificationCooldown = new Map<string, number>()
const COOLDOWN_MS = 60 * 1000

export async function changeEmail(payload: { newEmail: string }) {
  const uid = await ensureAdmin()
  const { newEmail } = changeEmailSchema.parse(payload)
  const now = Date.now()
  const last = changeEmailCooldown.get(uid) ?? 0
  if (now - last < COOLDOWN_MS) {
    throw new Error("Email change is temporarily rate limited")
  }
  const auth = getAdminAuth()
  if (!auth) throw new Error("Auth unavailable")
  await auth.updateUser(uid, { email: newEmail })
  changeEmailCooldown.set(uid, now)
  const db = getAdminDb()
  if (!db) throw new Error("Admin database unavailable")
  const currentSettings = await readUserSettings(db, uid)
  const displayName = currentSettings?.profile.displayName ?? newEmail
  const { settings, rollbackToken } = await persistUpdates(uid, {
    profile: { displayName, email: newEmail },
  })
  return { settings, rollbackToken }
}

export async function sendEmailVerification(payload: { email: string }) {
  const uid = await ensureAdmin()
  const { email } = sendVerificationSchema.parse(payload)
  const now = Date.now()
  const last = verificationCooldown.get(uid) ?? 0
  if (now - last < COOLDOWN_MS) {
    throw new Error("Verification already requested recently")
  }
  const auth = getAdminAuth()
  if (!auth) throw new Error("Auth unavailable")
  const link = await auth.generateEmailVerificationLink(email)
  verificationCooldown.set(uid, now)
  return { link }
}

export async function updateNotifications(input: NotificationsSettingsInput) {
  const uid = await ensureAdmin()
  const parsed = notificationsSettingsSchema.parse(input)
  return await persistUpdates(uid, { notifications: parsed })
}

export async function sendTestNotification(channel: "email" | "inApp") {
  const uid = await ensureAdmin()
  // Stub implementation – in a real system this would send via provider
  return { ok: true, channel, uid }
}

export async function updateAppearance(input: AppearanceSettingsInput) {
  const uid = await ensureAdmin()
  const parsed = appearanceSettingsSchema.parse(input)
  const contrast = getContrastRatio(parsed.accent)
  if (!contrast.meetsAA) {
    throw new Error("Accent color does not meet contrast requirements")
  }
  return await persistUpdates(uid, { appearance: parsed })
}

export async function resetAppearance() {
  const uid = await ensureAdmin()
  return await persistUpdates(uid, { appearance: DEFAULT_APPEARANCE })
}

export async function rollbackSettings(token: string) {
  const item = rollbackStore.get(token)
  if (!item) throw new Error("Rollback expired")
  if (item.expiresAt < Date.now()) {
    rollbackStore.delete(token)
    throw new Error("Rollback expired")
  }
  const { uid, previous } = item
  rollbackStore.delete(token)
  const db = getAdminDb()
  if (!db) throw new Error("Admin database unavailable")
  await writeUserSettings(db, uid, previous)
  revalidatePath(ACTION_PATH)
  return previous
}

setInterval(() => {
  const now = Date.now()
  for (const [token, entry] of rollbackStore) {
    if (entry.expiresAt < now) {
      rollbackStore.delete(token)
    }
  }
}, 60 * 1000).unref()