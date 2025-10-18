import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { createHash } from "crypto"
import type { Firestore } from "firebase-admin/firestore"
import {
  appearanceSettingsSchema,
  notificationsSettingsSchema,
  profileSettingsSchema,
  type AppearanceSettingsInput,
  type NotificationsSettingsInput,
  type ProfileSettingsInput,
  userSettingsSchema,
  type UserSettings,
} from "@/lib/schemas/settings"

export const DEFAULT_APPEARANCE: AppearanceSettingsInput = {
  theme: "system",
  accent: "#6366f1",
  density: "comfortable",
  reducedMotion: false,
}

export const DEFAULT_NOTIFICATIONS: NotificationsSettingsInput = {
  email: { enabled: true },
  inApp: { enabled: true },
  events: { comments: true, applications: true, system: true },
}

export const DEFAULT_PROFILE: ProfileSettingsInput = {
  displayName: "",
  email: "",
  bio: "",
  timezone: "",
  avatarUrl: "",
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: DEFAULT_PROFILE,
  notifications: DEFAULT_NOTIFICATIONS,
  appearance: DEFAULT_APPEARANCE,
  updatedAt: Date.now(),
}

export type ContrastResult = {
  ratio: number
  meetsAA: boolean
}

function hexToRgb(hex: string): [number, number, number] {
  let normalized = hex.replace("#", "")
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("")
  }
  const int = parseInt(normalized, 16)
  return [
    (int >> 16) & 255,
    (int >> 8) & 255,
    int & 255,
  ]
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = [r, g, b].map((value) => {
    const srgb = value / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return channel[0] * 0.2126 + channel[1] * 0.7152 + channel[2] * 0.0722
}

export function getContrastRatio(color: string, against = "#ffffff"): ContrastResult {
  const accent = luminance(hexToRgb(color))
  const surface = luminance(hexToRgb(against))
  const lighter = Math.max(accent, surface)
  const darker = Math.min(accent, surface)
  const ratio = (lighter + 0.05) / (darker + 0.05)
  return { ratio, meetsAA: ratio >= 4.5 }
}

export function ensureAccessibleAccent(color: string, surface = "#ffffff"): void {
  const { meetsAA } = getContrastRatio(color, surface)
  if (!meetsAA) {
    throw new Error("Accent color does not meet WCAG AA contrast requirements")
  }
}

export function initialsFromName(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?"
}

export function sanitizeProfileInput(input: ProfileSettingsInput): ProfileSettingsInput {
  const parsed = profileSettingsSchema.parse(input)
  return {
    ...parsed,
    bio: parsed.bio?.trim() || "",
    timezone: parsed.timezone?.trim() || "",
    avatarUrl: parsed.avatarUrl?.trim() || "",
  }
}

export function sanitizeNotificationsInput(
  input: NotificationsSettingsInput,
): NotificationsSettingsInput {
  return notificationsSettingsSchema.parse(input)
}

export function sanitizeAppearanceInput(input: AppearanceSettingsInput): AppearanceSettingsInput {
  const parsed = appearanceSettingsSchema.parse(input)
  ensureAccessibleAccent(parsed.accent)
  return parsed
}

export function mergeSettings(
  existing: UserSettings | null,
  updates: Partial<UserSettings>,
): UserSettings {
  const base = existing ?? DEFAULT_USER_SETTINGS
  const merged: UserSettings = {
    ...base,
    profile: { ...base.profile, ...updates.profile },
    notifications: { ...base.notifications, ...updates.notifications },
    appearance: { ...base.appearance, ...updates.appearance },
    updatedAt: Date.now(),
  }
  return merged
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

export function hashAvatar(buffer: ArrayBuffer | Uint8Array): string {
  const hash = createHash("sha1")
  hash.update(Buffer.from(buffer))
  return hash.digest("hex")
}