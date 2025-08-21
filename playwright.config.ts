import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Exclude Jest-only spec from Playwright runs
  testIgnore: ['validate-session.spec.ts'],
  timeout: 30000,
  retries: 0,
  webServer: {
    // Run the app in PRODUCTION for stable e2e (no dev overlay, proper metadata)
    command: 'pnpm -s build && pnpm -s start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false, // always use the prod server started above
    timeout: 120_000, // give Next.js extra time to boot
    env: {
      PORT: '3000',

      // Bypass admin auth in tests (pair this with server-side check)
      ADMIN_BYPASS: 'true',
      ADMIN_AUTH_DISABLED: '1',

      // Public Firebase envs (test placeholders)
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'test',

      // GTM/cookie banner testing flags
      NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER: 'true',
      NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: '/admin,/wp-admin,/dashboard,/backend',
      NEXT_PUBLIC_GTM_CONTAINER_ID: '',
      NEXT_PUBLIC_LIVE_HOSTNAMES: 'localhost,127.0.0.1',

      // Keep telemetry quiet in CI logs (optional)
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production',
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
  },
});
