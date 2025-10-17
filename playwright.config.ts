import path from "node:path";
import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultBaseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const storageState = path.join(repoRoot, "e2e/.auth/admin.json");

export default defineConfig({
  testDir: "e2e",
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
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
    command: "pnpm start:test",
    url: defaultBaseUrl,
    cwd: repoRoot,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "test",
      NEXT_TELEMETRY_DISABLED: "1",
      E2E: "true",
    },
  },
});
