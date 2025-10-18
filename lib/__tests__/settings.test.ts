import {
  appearanceSettingsSchema,
  notificationsSettingsSchema,
  profileSettingsSchema,
} from "@/lib/schemas/settings"
import { DEFAULT_NOTIFICATIONS, getContrastRatio, mergeSettings } from "@/lib/settings"

describe("settings schemas", () => {
  it("validates profile display name length", () => {
    expect(() => profileSettingsSchema.parse({
      displayName: "A",
      email: "user@example.com",
      bio: "",
      timezone: "UTC",
      avatarUrl: "",
    })).toThrow()

    expect(() =>
      profileSettingsSchema.parse({
        displayName: "Valid User",
        email: "user@example.com",
        bio: "",
        timezone: "UTC",
        avatarUrl: "https://example.com/avatar.png",
      }),
    ).not.toThrow()
  })

  it("validates accent hex", () => {
    expect(() =>
      appearanceSettingsSchema.parse({
        theme: "light",
        accent: "#ff00ff",
      }),
    ).not.toThrow()

    expect(() =>
      appearanceSettingsSchema.parse({
        theme: "light",
        accent: "red",
      }),
    ).toThrow()
  })

  it("requires quiet hours format", () => {
    expect(() =>
      notificationsSettingsSchema.parse({
        email: { enabled: true },
        inApp: { enabled: true },
        events: { comments: true, applications: true, system: true },
        quiet: { from: "22:00", to: "07:00" },
      }),
    ).not.toThrow()

    expect(() =>
      notificationsSettingsSchema.parse({
        email: { enabled: true },
        inApp: { enabled: true },
        events: { comments: true, applications: true, system: true },
        quiet: { from: "10", to: "07:00" },
      }),
    ).toThrow()
  })
})

describe("contrast helper", () => {
  it("computes accessible accent ratios", () => {
    const contrast = getContrastRatio("#000000")
    expect(contrast.meetsAA).toBe(true)
    expect(contrast.ratio).toBeGreaterThan(4.5)
  })
})

describe("mergeSettings", () => {
  it("merges updates into defaults", () => {
    const result = mergeSettings(null, {
      profile: { displayName: "User", email: "user@example.com" },
    })
    expect(result.profile.displayName).toBe("User")
    expect(result.notifications).toEqual(DEFAULT_NOTIFICATIONS)
  })
})