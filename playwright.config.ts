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
const useProdServer = isCI || process.env.E2E_PROD_SERVER === "1";

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
    command: useProdServer ? "pnpm e2e:serve" : "pnpm start:test",
    url: defaultBaseUrl,
    cwd: repoRoot,
    reuseExistingServer: !isCI && !useProdServer,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 180_000,
    env: useProdServer
      ? process.env
      : {
          ...process.env,
          NODE_ENV: "test",
          NEXT_TELEMETRY_DISABLED: "1",
          E2E: "true",
        },
  },
});
