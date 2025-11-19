import { serverEnv } from "@/env/server";
import { ADMIN_BYPASS } from "@/lib/firebase-admin";
import { isE2EEnabled } from "@/lib/e2e-utils";
import {
  DEFAULT_APPEARANCE,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PROFILE,
} from "@/lib/settings/common";
import type { UserSettings } from "@/lib/schemas/settings";

const truthy = (value?: string | null): boolean =>
  value === "true" || value === "1";

export function shouldUseAdminSettingsFixtures(): boolean {
  if (ADMIN_BYPASS) {
    return true;
  }

  if (truthy(serverEnv.ADMIN_AUTH_DISABLED) || truthy(process.env.ADMIN_AUTH_DISABLED)) {
    return true;
  }

  if (truthy(serverEnv.USE_DEMO_CONTENT) || truthy(process.env.USE_DEMO_CONTENT)) {
    return true;
  }

  if (isE2EEnabled()) {
    return true;
  }

  return false;
}

export function buildAdminSettingsFixture(): UserSettings {
  return {
    profile: {
      ...DEFAULT_PROFILE,
      displayName: DEFAULT_PROFILE.displayName || "Admin Fixture",
      email: DEFAULT_PROFILE.email || "admin@example.com",
      timezone: DEFAULT_PROFILE.timezone || "UTC",
      bio:
        DEFAULT_PROFILE.bio ||
        "Admin settings are running in read-only fixture mode. Provide FIREBASE_SERVICE_ACCOUNT_KEY to enable persistence.",
    },
    notifications: JSON.parse(
      JSON.stringify(DEFAULT_NOTIFICATIONS),
    ) as UserSettings["notifications"],
    appearance: { ...DEFAULT_APPEARANCE },
    updatedAt: Date.now(),
  };
}