import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const fontMockPath = path.join(scriptsDir, 'mock-font-fetch.cjs');

const env = {
  ...process.env,
  PORT: '3000',

  NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:3000',
  BASE_URL: 'http://127.0.0.1:3000',
  NEXTAUTH_URL: 'http://127.0.0.1:3000',

  ADMIN_BYPASS: 'true',
  ADMIN_AUTH_DISABLED: '1',
  ADMIN_JWT_SECRET: 'test-secret',
  CRON_SECRET: 'test-secret',
  ADMIN_REQUIRE_EMAIL_VERIFICATION: 'true',
  NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION: 'true',

  NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'test',
  FIREBASE_STORAGE_BUCKET: 'test',

  NEXT_TELEMETRY_DISABLED: '1',
  NODE_ENV: 'production' satisfies NodeJS.ProcessEnv['NODE_ENV'],
  NEXT_DISABLE_MINIFY: 'true',
  TEST_MODE: 'true',
  NEXT_DISABLE_FONT_DOWNLOADS: '1',
  NODE_OPTIONS: `--require ${fontMockPath}`,
} satisfies NodeJS.ProcessEnv;

try {
  await new Promise<void>((resolve, reject) => {
    const build = spawn('pnpm', ['-s', 'build'], {
      stdio: 'inherit',
      env,
    });

    build.on('close', (code, signal) => {
      if (signal) {
        reject(new Error(`build process terminated with signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`build process exited with code ${code ?? 'unknown'}`));
        return;
      }

      resolve();
    });

    build.on('error', reject);
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}