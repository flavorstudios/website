import path from "node:path";
import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const isCI = process.env.CI === "true" || process.env.CI === "1";
const localBaseUrl = "http://127.0.0.1:3000";

// let CI override, but only if we *explicitly* say so
const explicitBaseUrl =
  process.env.E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL;

// In CI we want to test the server we start here, not the public BASE_URL
const defaultBaseUrl =
  explicitBaseUrl ?? (isCI ? localBaseUrl : process.env.BASE_URL ?? localBaseUrl);

const storageState = path.join(repoRoot, "e2e/.auth/admin.json");
const webServerTimeout = Number(process.env.PLAYWRIGHT_WEB_SERVER_TIMEOUT ?? 180_000);

const webServerEnv = {
  SKIP_STRICT_ENV: process.env.SKIP_STRICT_ENV ?? "1",
  E2E: process.env.E2E ?? "1",
  NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? "1",
  NEXT_DISABLE_FONT_DOWNLOADS: process.env.NEXT_DISABLE_FONT_DOWNLOADS ?? "1",
  ADMIN_BYPASS: process.env.ADMIN_BYPASS ?? "true",
  ADMIN_AUTH_DISABLED: process.env.ADMIN_AUTH_DISABLED ?? "1",
  NEXT_PUBLIC_E2E: process.env.NEXT_PUBLIC_E2E ?? "1",
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "test-auth.local",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-project.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1234567890:web:testappid",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-TESTMEASURE",
  NEXT_PUBLIC_FIREBASE_VAPID_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "test-vapid-key",
} as const;

// ✅ toggle to run only the safe/smoke tests in CI
// set CI_E2E_SMOKE=1 in the workflow to skip the 2 flaky admin-dashboard tests
const ciSmokeMode = isCI && process.env.CI_E2E_SMOKE === "1";

export default defineConfig({
  testDir: ".",
  testMatch: ["e2e/**/*.spec.ts", "tests/**/*.spec.ts"],
  // when smoke mode is ON, we just skip the 2 tests that still need local route control
  testIgnore: ciSmokeMode
    ? [
        "e2e/admin-dashboard-blog-fallback.e2e.spec.ts",
        "e2e/admin-dashboard-error.e2e.spec.ts",
      ]
    : [],
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  retries: isCI ? 1 : 0,
  use: {
    headless: true,
    baseURL: defaultBaseUrl,
    testIdAttribute: "data-testid",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    viewport: { width: 1280, height: 900 },
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    colorScheme: "light",
    storageState,
  },
  projects: [
    { name: "chromium-light", use: { colorScheme: "light" } },
    { name: "chromium-dark", use: { colorScheme: "dark" } },
  ],
  globalSetup: path.join(repoRoot, "e2e/setup/global-setup.ts"),
  webServer: {
    command: "pnpm -s build && pnpm -s start:test:prod",
    url: defaultBaseUrl,
    cwd: repoRoot,
    reuseExistingServer: !isCI,
    env: webServerEnv,
    stdout: "pipe",
    stderr: "pipe",
    timeout: webServerTimeout,
  },
});
