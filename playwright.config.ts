import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      ADMIN_AUTH_DISABLED: '1',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'test',
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
});