import path from 'node:path';
import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true
  },
  webServer: {
    // Build already done in workflow. Just start prod server.
    command: 'pnpm start -p 3000',
    url: 'http://127.0.0.1:3000',
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
      // mirror the same FIREBASE_SERVICE_ACCOUNT_JSON env from CI if needed locally
      ...(process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? { FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON }
        : {}),
    }
  }
});
