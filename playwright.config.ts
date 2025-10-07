import path from 'node:path';
import { defineConfig } from '@playwright/test';

const repoRoot = process.cwd();
const fontMockPath = path.join(repoRoot, 'scripts/mock-font-fetch.cjs');

export default defineConfig({
  testDir: './tests',
  // Exclude Jest-only tests from Playwright runs
  testIgnore: [
    // Ignore any Jest-style unit test filenames so Playwright only runs e2e specs
    '**/*.test.{ts,tsx,js,jsx}',
    'validate-session.spec.ts',
    'firebase-admin.test.ts',
    'cron.spec.ts',
    'storage.rules.test.ts',
    'admin-dashboard-prefetch.spec.tsx',
  ],
  timeout: 30000,
  retries: 0,
  webServer: {
    // Run the app in PRODUCTION for stable e2e (no dev overlay, proper metadata)
    command: 'pnpm -s start',
    cwd: repoRoot,
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false, // always use the prod server started above
    timeout: 120_000, // give Next.js extra time to boot
    env: {
      PORT: '3000',

      NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:3000',
      BASE_URL: 'http://127.0.0.1:3000',
      NEXTAUTH_URL: 'http://127.0.0.1:3000',

      // Bypass admin auth in tests (pair this with server-side check)
      ADMIN_BYPASS: 'true',
      ADMIN_AUTH_DISABLED: '1',
      ADMIN_JWT_SECRET: 'test-secret',
      CRON_SECRET: 'test-secret',
      ADMIN_REQUIRE_EMAIL_VERIFICATION: 'true',
      NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION: 'true',

      // Public Firebase envs (test placeholders)
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'test',
      FIREBASE_STORAGE_BUCKET: 'test',

      // Keep telemetry quiet in CI logs (optional)
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production',
      NEXT_DISABLE_MINIFY: 'true',
      NEXT_PUBLIC_TEST_MODE: 'true',
      TEST_MODE: 'true',
      NEXT_DISABLE_FONT_DOWNLOADS: '1',
      E2E: 'true',
      NODE_OPTIONS: `--require ${fontMockPath}`,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
  },
});
