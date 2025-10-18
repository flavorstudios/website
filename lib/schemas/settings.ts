import { z } from "zod"

const accentRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const avatarFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(2 * 1024 * 1024, "Avatar must be 2MB or smaller"),
  type: z.enum(["image/png", "image/jpeg", "image/jpg", "image/webp"]),
})

export const profileSettingsSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be at most 50 characters"),
  email: z.string().email("Enter a valid email address"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  avatarStoragePath: z.string().optional(),
})

export const notificationsSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
  }),
  inApp: z.object({
    enabled: z.boolean(),
  }),
  events: z.object({
    comments: z.boolean(),
    applications: z.boolean(),
    system: z.boolean(),
  }),
  quiet: z
    .object({
      from: z.string().regex(timeRegex, "Quiet hours must use HH:mm format"),
      to: z.string().regex(timeRegex, "Quiet hours must use HH:mm format"),
    })
    .optional(),
})

export const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  accent: z.string().regex(accentRegex, "Accent color must be a valid hex value"),
  density: z.enum(["comfortable", "compact"]).optional(),
  reducedMotion: z.boolean().optional(),
})

export const userSettingsSchema = z.object({
  profile: profileSettingsSchema,
  notifications: notificationsSettingsSchema,
  appearance: appearanceSettingsSchema,
  updatedAt: z.number().optional(),
})

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>
export type NotificationsSettingsInput = z.infer<typeof notificationsSettingsSchema>
export type AppearanceSettingsInput = z.infer<typeof appearanceSettingsSchema>
export type UserSettings = z.infer<typeof userSettingsSchema>

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Enter a valid email address"),
})

export const sendVerificationSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export const appearancePreviewSchema = appearanceSettingsSchema.pick({
  theme: true,
  accent: true,
  density: true,
  reducedMotion: true,
})

export type AppearancePreview = z.infer<typeof appearancePreviewSchema>