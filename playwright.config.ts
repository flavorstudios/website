import path from 'node:path';
import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultBaseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'e2e',
  reporter: 'list',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    headless: true,
    baseURL: defaultBaseUrl,
  },
  webServer: {
    command: 'pnpm start -p 3000',
    url: defaultBaseUrl,
    cwd: repoRoot,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      TEST_MODE: 'true',
      E2E: 'true',
      ADMIN_AUTH_DISABLED: '1',
      ADMIN_BYPASS: 'true',
      ...(process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? { FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON }
        : {}),
    },
  },
});
