'use server'

import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import nodemailer from "nodemailer"
import { requireAdminAction } from "@/lib/admin-auth"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"
import {
  appearanceSettingsSchema,
  avatarFileSchema,
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
  hashAvatar,
  uploadAvatarObject,
  deleteStorageObject,
  writeUserSettings,
} from "@/lib/settings/server"
import { serverEnv } from "@/env/server"
import { isTestMode } from "@/config/flags"
import { SITE_NAME, SITE_URL } from "@/lib/constants"
import { logError } from "@/lib/log"
import { SettingsAccessError } from "./errors"
import {
  buildAdminSettingsFixture,
  shouldUseAdminSettingsFixtures,
} from "@/lib/admin/settings-fixture-guard"

const SETTINGS_READ_ONLY_MESSAGE =
  "Admin settings are read-only in this environment. Configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON to enable persistence."

function requireSettingsDb(context: string, meta?: Record<string, unknown>) {
  if (shouldUseAdminSettingsFixtures()) {
    throw new SettingsAccessError(
      "ADMIN_SDK_UNAVAILABLE",
      SETTINGS_READ_ONLY_MESSAGE,
    )
  }
  try {
    return getAdminDb()
  } catch (error) {
    logError(`${context}:firestore-unavailable`, error, meta)
    throw new SettingsAccessError(
      "ADMIN_SDK_UNAVAILABLE",
      "Admin Firestore is unavailable. Configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON.",
      { cause: error },
    )
  }
}

function requireSettingsAuth(context: string, meta?: Record<string, unknown>) {
  if (shouldUseAdminSettingsFixtures()) {
    throw new SettingsAccessError(
      "ADMIN_SDK_UNAVAILABLE",
      SETTINGS_READ_ONLY_MESSAGE,
    )
  }
  try {
    return getAdminAuth()
  } catch (error) {
    logError(`${context}:auth-unavailable`, error, meta)
    throw new SettingsAccessError(
      "ADMIN_SDK_UNAVAILABLE",
      "Admin authentication is unavailable. Configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON.",
      { cause: error },
    )
  }
}

type RollbackEntry = {
  previous: UserSettings
  expiresAt: number
  uid: string
  previousAuthEmail?: string | null
  previousEmailVerified?: boolean
  onRollback?: () => Promise<void> | void
  onExpire?: () => Promise<void> | void
}

const rollbackStore = new Map<string, RollbackEntry>()

const ACTION_PATH = "/admin/dashboard/settings"
const ROLLBACK_TTL = 1000 * 60 * 5

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (isTestMode()) {
    return null
  }
  if (!serverEnv.SMTP_HOST) {
    throw new SettingsAccessError(
      "EMAIL_TRANSPORT_UNCONFIGURED",
      "Email transport is not configured. Set SMTP_HOST/SMTP_USER to send verification messages.",
    )
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: serverEnv.SMTP_HOST,
      port: Number(serverEnv.SMTP_PORT ?? 587),
      secure: serverEnv.SMTP_SECURE === "true",
      auth: serverEnv.SMTP_USER
        ? {
            user: serverEnv.SMTP_USER,
            pass: serverEnv.SMTP_PASS,
          }
        : undefined,
    })
  }
  return cachedTransporter
}

async function sendVerificationEmailMessage({
  email,
  link,
  subject,
  heading,
  intro,
}: {
  email: string
  link: string
  subject: string
  heading: string
  intro: string
}) {
  const transporter = getTransporter()
  if (!transporter) return
  const fromAddress =
    serverEnv.SMTP_USER || serverEnv.ADMIN_EMAIL || `no-reply@${new URL(SITE_URL).hostname}`
  const html = `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);">
          <h1 style="font-size: 20px; margin: 0 0 16px; color: #0f172a;">${heading}</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;">${intro}</p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${link}" style="display: inline-block; padding: 12px 24px; font-size: 15px; color: #ffffff; background-color: #2563eb; border-radius: 8px; text-decoration: none;">Confirm email</a>
          </p>
          <p style="font-size: 12px; color: #64748b; line-height: 1.6;">If the button doesn’t work, copy and paste this link into your browser:<br /><span style="word-break: break-all;">${link}</span></p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">${SITE_NAME}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`
  const text = `${intro}\n\n${link}`
  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject,
    html,
    text,
  })
}

type PersistOptions = Pick<
  RollbackEntry,
  "previousAuthEmail" | "previousEmailVerified" | "onRollback" | "onExpire"
> & {
  currentSettings?: UserSettings | null
}

async function ensureAdmin(context = "admin-settings"): Promise<string> {
  const authorized = await requireAdminAction()
  if (!authorized) {
    logError(`${context}:unauthorized`, "Admin session missing or lacks permissions")
    throw new SettingsAccessError(
      "UNAUTHORIZED",
      "You do not have permission to manage admin settings.",
    )
  }
  try {
    return await getCurrentAdminUid()
  } catch (error) {
    logError(`${context}:uid`, error)
    throw new SettingsAccessError(
      "UNAUTHORIZED",
      "Failed to resolve the current admin user from the session.",
      { cause: error },
    )
  }
}

export async function loadSettings(): Promise<UserSettings> {
  const uid = await ensureAdmin("admin-settings:loadSettings")
  if (shouldUseAdminSettingsFixtures()) {
    return buildAdminSettingsFixture()
  }
  const db = requireSettingsDb("admin-settings:loadSettings", { uid })

  try {
    const settings = await readUserSettings(db, uid)
    if (settings) return settings
    await writeUserSettings(db, uid, {})
    const fresh = await readUserSettings(db, uid)
    if (!fresh) {
      throw new SettingsAccessError(
        "FIRESTORE_ERROR",
        "Failed to initialize admin settings document.",
      )
    }
    return fresh
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      throw error
    }
    logError("admin-settings:loadSettings", error, { uid })
    throw new SettingsAccessError(
      "FIRESTORE_ERROR",
      "Unable to load admin settings from Firestore.",
      { cause: error },
    )
  }
}

function createRollback(
  uid: string,
  previous: UserSettings,
  meta?: PersistOptions,
): string {
  const token = randomUUID()
  rollbackStore.set(token, {
    previous,
    uid,
    expiresAt: Date.now() + ROLLBACK_TTL,
    previousAuthEmail: meta?.previousAuthEmail,
    previousEmailVerified: meta?.previousEmailVerified,
    onRollback: meta?.onRollback,
    onExpire: meta?.onExpire,
  })
  return token
}

async function persistUpdates(
  uid: string,
  updates: Partial<UserSettings>,
  options?: PersistOptions,
): Promise<{ settings: UserSettings; rollbackToken: string }> {
  const meta = { uid, updates: Object.keys(updates) }
  const db = requireSettingsDb("admin-settings:persistUpdates", meta)
  try {
    const current = options?.currentSettings ?? (await readUserSettings(db, uid))
    const settings = await writeUserSettings(db, uid, updates)
    const rollbackToken = createRollback(uid, current ?? settings, options)
    revalidatePath(ACTION_PATH)
    return { settings, rollbackToken }
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      throw error
    }
    logError("admin-settings:persistUpdates", error, meta)
    throw new SettingsAccessError(
      "FIRESTORE_ERROR",
      "Unable to persist admin settings changes.",
      { cause: error },
    )
  }
}

export async function updateProfile(input: ProfileSettingsInput) {
  const uid = await ensureAdmin("admin-settings:updateProfile")
  const parsed = profileSettingsSchema.parse(input)
  const db = requireSettingsDb("admin-settings:updateProfile", { uid })
  let currentSettings: UserSettings | null = null
  try {
    currentSettings = await readUserSettings(db, uid)
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      throw error
    }
    logError("admin-settings:updateProfile:read", error, { uid })
    throw new SettingsAccessError(
      "FIRESTORE_ERROR",
      "Unable to read existing profile settings.",
      { cause: error },
    )
  }
  const previousAvatarPath = currentSettings?.profile.avatarStoragePath ?? null
  const nextAvatarPath = parsed.avatarStoragePath ?? null
  const hasNewAvatar = Boolean(nextAvatarPath && nextAvatarPath !== previousAvatarPath)
  const removingAvatar = !nextAvatarPath && Boolean(previousAvatarPath)
  const options: PersistOptions = { currentSettings }

  if (hasNewAvatar) {
    options.onRollback = async () => {
      if (nextAvatarPath) {
        try {
          await deleteStorageObject(nextAvatarPath)
        } catch {
          // Ignore cleanup failure during rollback
        }
      }
    }
    if (previousAvatarPath) {
      options.onExpire = async () => {
        try {
          await deleteStorageObject(previousAvatarPath)
        } catch {
          // Ignore cleanup failure on expiry
        }
      }
    }
  } else if (removingAvatar && previousAvatarPath) {
    options.onExpire = async () => {
      try {
        await deleteStorageObject(previousAvatarPath)
      } catch {
        // Ignore cleanup failure on expiry
      }
    }
  }

  try {
    return await persistUpdates(uid, { profile: parsed }, options)
  } catch (error) {
    if (hasNewAvatar && nextAvatarPath) {
      try {
        await deleteStorageObject(nextAvatarPath)
      } catch {
        // Cleanup best-effort
      }
    }
    throw error
  }
}

export async function uploadAvatar(formData: FormData) {
  const uid = await ensureAdmin("admin-settings:uploadAvatar")
  if (shouldUseAdminSettingsFixtures()) {
    throw new SettingsAccessError(
      "ADMIN_SDK_UNAVAILABLE",
      SETTINGS_READ_ONLY_MESSAGE,
    )
  }
  const file = formData.get("file")
  if (!(file instanceof File)) {
    throw new Error("Avatar file is required")
  }
  const name = file.name || "avatar.webp"
  const type = file.type || "image/webp"
  avatarFileSchema.parse({ name, size: file.size, type })
  const buffer = Buffer.from(await file.arrayBuffer())
  const hash = await hashAvatar(buffer)
  const { url, path } = await uploadAvatarObject(uid, hash, buffer)
  return { url, storagePath: path }
}

const changeEmailCooldown = new Map<string, number>()
const verificationCooldown = new Map<string, number>()
const COOLDOWN_MS = 60 * 1000

export async function changeEmail(payload: { newEmail: string; reauthToken: string }) {
  const uid = await ensureAdmin("admin-settings:changeEmail")
  const { newEmail, reauthToken } = changeEmailSchema.parse(payload)
  const now = Date.now()
  const last = changeEmailCooldown.get(uid) ?? 0
  if (now - last < COOLDOWN_MS) {
    throw new Error("Email change is temporarily rate limited")
  }
  const auth = requireSettingsAuth("admin-settings:changeEmail", { uid })

  const decoded = await auth.verifyIdToken(reauthToken, true)
  if (!decoded || decoded.uid !== uid) {
    throw new Error("Reauthentication required")
  }

  const record = await auth.getUser(uid)
  const previousEmail = record.email ?? null
  const previousEmailVerified = record.emailVerified ?? false
  const verificationLink = await auth.generateEmailVerificationLink(newEmail)

  await auth.updateUser(uid, { email: newEmail, emailVerified: false })

  try {
    await sendVerificationEmailMessage({
      email: newEmail,
      link: verificationLink,
      subject: `${SITE_NAME} – Confirm your new email address`,
      heading: "Confirm your new email address",
      intro: `We received a request to change the email on your ${SITE_NAME} admin account. Click the link below to confirm this change.`,
    })
  } catch (error) {
    await auth.updateUser(uid, {
      email: previousEmail ?? newEmail,
      emailVerified: previousEmailVerified,
    })
    if (error instanceof SettingsAccessError) {
      logError("admin-settings:changeEmail:transport", error, { uid })
      throw error
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to send verification email")
  }

  const db = requireSettingsDb("admin-settings:changeEmail", { uid })
  let currentSettings: UserSettings | null = null
  try {
    currentSettings = await readUserSettings(db, uid)
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      throw error
    }
    logError("admin-settings:changeEmail:read", error, { uid })
    throw new SettingsAccessError(
      "FIRESTORE_ERROR",
      "Unable to read settings while changing email.",
      { cause: error },
    )
  }
  const baseProfile = currentSettings?.profile ?? {
    displayName: "",
    email: "",
    bio: "",
    timezone: "",
    avatarUrl: "",
    avatarStoragePath: undefined,
  }
  const profileUpdate = profileSettingsSchema.parse({
    ...baseProfile,
    email: newEmail,
    displayName: baseProfile.displayName || newEmail,
  })

  try {
    const { settings, rollbackToken } = await persistUpdates(
      uid,
      { profile: profileUpdate },
      {
        currentSettings,
        previousAuthEmail: previousEmail,
        previousEmailVerified,
      },
    )
    changeEmailCooldown.set(uid, now)
    return { settings, rollbackToken }
  } catch (error) {
    await auth.updateUser(uid, {
      email: previousEmail ?? newEmail,
      emailVerified: previousEmailVerified,
    })
    throw error
  }
}

export async function sendEmailVerification(payload: { email: string }) {
  const uid = await ensureAdmin("admin-settings:sendEmailVerification")
  const { email } = sendVerificationSchema.parse(payload)
  const now = Date.now()
  const last = verificationCooldown.get(uid) ?? 0
  if (now - last < COOLDOWN_MS) {
    throw new Error("Verification already requested recently")
  }
  const auth = requireSettingsAuth("admin-settings:sendEmailVerification", { uid })
  const link = await auth.generateEmailVerificationLink(email)
  try {
    await sendVerificationEmailMessage({
      email,
      link,
      subject: `${SITE_NAME} – Verify your email address`,
      heading: "Verify your email address",
      intro: `Confirm your email to secure your ${SITE_NAME} admin account.`,
    })
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      logError("admin-settings:sendEmailVerification:transport", error, { uid })
      throw error
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to send verification email")
  }
  verificationCooldown.set(uid, now)
  return { ok: true }
}

export async function updateNotifications(input: NotificationsSettingsInput) {
  const uid = await ensureAdmin("admin-settings:updateNotifications")
  const parsed = notificationsSettingsSchema.parse(input)
  return await persistUpdates(uid, { notifications: parsed })
}

export async function sendTestNotification(channel: "email" | "inApp") {
  const uid = await ensureAdmin("admin-settings:sendTestNotification")
  // Stub implementation – in a real system this would send via provider
  return { ok: true, channel, uid }
}

export async function updateAppearance(input: AppearanceSettingsInput) {
  const uid = await ensureAdmin("admin-settings:updateAppearance")
  const parsed = appearanceSettingsSchema.parse(input)
  const contrast = getContrastRatio(parsed.accent)
  if (!contrast.meetsAA) {
    throw new Error("Accent color does not meet contrast requirements")
  }
  return await persistUpdates(uid, { appearance: parsed })
}

export async function resetAppearance() {
  const uid = await ensureAdmin("admin-settings:resetAppearance")
  return await persistUpdates(uid, { appearance: DEFAULT_APPEARANCE })
}

export async function rollbackSettings(token: string) {
  const item = rollbackStore.get(token)
  if (!item)
    throw new SettingsAccessError(
      "ROLLBACK_INVALID",
      "Rollback token is invalid or has expired.",
    )
  if (item.expiresAt < Date.now()) {
    if (item.onExpire) {
      await Promise.resolve(item.onExpire())
    }
    rollbackStore.delete(token)
    throw new SettingsAccessError(
      "ROLLBACK_INVALID",
      "Rollback token is invalid or has expired.",
    )
  }
  const { uid, previous, previousAuthEmail, previousEmailVerified, onRollback } = item
  rollbackStore.delete(token)
  const db = requireSettingsDb("admin-settings:rollbackSettings", { uid })
  try {
    await writeUserSettings(db, uid, previous)
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      throw error
    }
    logError("admin-settings:rollbackSettings", error, { uid })
    throw new SettingsAccessError(
      "FIRESTORE_ERROR",
      "Unable to restore previous admin settings.",
      { cause: error },
    )
  }
  if (previousAuthEmail) {
    const auth = requireSettingsAuth("admin-settings:rollbackSettings", { uid })
    await auth.updateUser(uid, {
      email: previousAuthEmail,
      emailVerified: previousEmailVerified ?? false,
    })
  }
  if (onRollback) {
    await Promise.resolve(onRollback())
  }
  revalidatePath(ACTION_PATH)
  return previous
}

setInterval(() => {
  const now = Date.now()
  for (const [token, entry] of rollbackStore) {
    if (entry.expiresAt < now) {
      if (entry.onExpire) {
        void Promise.resolve(entry.onExpire()).catch(() => undefined)
      }
      rollbackStore.delete(token)
    }
  }
}, 60 * 1000).unref()