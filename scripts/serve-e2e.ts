import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { access, constants, rm } from 'node:fs/promises';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const fontMockPath = path.join(scriptsDir, 'mock-font-fetch.cjs');
const repoRoot = path.resolve(scriptsDir, '..');
const nextDir = path.join(repoRoot, '.next');

const env = {
  ...process.env,
  PORT: '3000',
  NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:3000',
  NEXT_PUBLIC_E2E: '1',
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
  NEXT_PUBLIC_TEST_MODE: '1',
  NEXT_DISABLE_FONT_DOWNLOADS: '1',
  E2E: 'true',
  NODE_OPTIONS: `--require ${fontMockPath}`,
} satisfies NodeJS.ProcessEnv;

async function runBuild() {
  await new Promise<void>((resolve, reject) => {
    const build = spawn('pnpm', ['-s', 'build'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env,
    });

    build.on('close', async (code, signal) => {
      if (signal) {
        reject(new Error(`build terminated with signal ${signal}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`build exited with code ${code ?? 'unknown'}`));
        return;
      }
      resolve();
    });

    build.on('error', reject);
  });

  const buildIdPath = path.join(nextDir, 'BUILD_ID');
  const expectedArtifactPaths = [
    path.join(nextDir, 'server'),
    path.join(nextDir, 'server/app'),
    path.join(nextDir, 'server/pages'),
    path.join(nextDir, 'standalone'),
    path.join(nextDir, 'app'),
    path.join(nextDir, 'static'),
  ];

  const buildIdExists = await access(buildIdPath, constants.F_OK)
    .then(() => true)
    .catch(() => false);

  const hasArtifacts = await Promise.all(
    expectedArtifactPaths.map((artifactPath) =>
      access(artifactPath, constants.F_OK)
        .then(() => true)
        .catch(() => false),
    ),
  ).then((results) => results.some(Boolean));

  if (!buildIdExists || !hasArtifacts) {
    throw new Error('Next.js build artifacts are missing.');
  }
}

async function main() {
  try {
    await runBuild();
  } catch (error) {
    await rm(nextDir, { recursive: true, force: true }).catch(() => undefined);
    console.error(error);
    process.exit(1);
  }

  const server = spawn('pnpm', ['-s', 'start', '-p', '3000'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env,
  });

  const terminate = (signal: NodeJS.Signals) => {
    server.kill(signal);
  };

  process.on('SIGINT', terminate);
  process.on('SIGTERM', terminate);

  server.on('close', (code, signal) => {
    if (signal) {
      process.exit(1);
      return;
    }
    process.exit(code ?? 0);
  });

  server.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
}

void main();