import { describe, expect, test } from "@jest/globals"
import {
  changeEmailSchema,
  profileSettingsSchema,
  userSettingsSchema,
} from "@/lib/schemas/settings"
import { mergeSettings } from "@/lib/settings/common"

describe("settings schemas", () => {
  test("changeEmailSchema requires reauth token", () => {
    expect(() =>
      changeEmailSchema.parse({ newEmail: "admin@example.com", reauthToken: "token-12345" }),
    ).not.toThrow()

    expect(() => changeEmailSchema.parse({ newEmail: "admin@example.com" } as any)).toThrow()
  })

  test("profileSettingsSchema normalises avatarStoragePath", () => {
    const parsed = profileSettingsSchema.parse({
      displayName: "Admin",
      email: "admin@example.com",
      avatarUrl: "https://example.com/avatar.png",
      avatarStoragePath: "",
    })
    expect(parsed.avatarStoragePath).toBeUndefined()

    expect(() =>
      profileSettingsSchema.parse({
        displayName: "Admin",
        email: "admin@example.com",
        avatarUrl: "https://example.com/avatar.png",
        avatarStoragePath: "invalid/path.jpg",
      }),
    ).toThrow()
  })

  test("mergeSettings prunes undefined overrides", () => {
    const validPath = `users/test/avatar/${"a".repeat(40)}.webp`
    const base = userSettingsSchema.parse({
      profile: {
        displayName: "Admin",
        email: "admin@example.com",
        bio: "",
        timezone: "UTC",
        avatarUrl: "https://example.com/avatar.png",
        avatarStoragePath: validPath,
      },
      notifications: {
        email: { enabled: true },
        inApp: { enabled: true },
        events: { comments: true, applications: true, system: true },
      },
      appearance: {
        theme: "system",
        accent: "#6366f1",
        density: "comfortable",
        reducedMotion: false,
      },
      updatedAt: Date.now(),
    })

    const merged = mergeSettings(base, {
      profile: {
        avatarStoragePath: undefined,
      },
    })

    expect(merged.profile.avatarStoragePath).toBeUndefined()
  })
})