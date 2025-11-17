/** @jest-environment node */

import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';

const trackedKeys = [
  'NODE_ENV',
  'NEXT_PUBLIC_BASE_URL',
  'VERCEL_ENV',
  'VERCEL_URL',
  'CRON_SECRET',
  'PREVIEW_SECRET',
  'BASE_URL',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'ADMIN_BYPASS',
];

const setNodeEnv = (value: string | undefined) => {
  setEnv('NODE_ENV', value);
};

describe("server env bootstrap", () => {
  const originalEnv = snapshotEnv(trackedKeys);

  beforeEach(() => {
    jest.resetModules();
    restoreEnv(originalEnv);
    setEnv('NEXT_PUBLIC_BASE_URL', undefined);
    setEnv('VERCEL_ENV', undefined);
    setEnv('VERCEL_URL', undefined);
    setEnv('CRON_SECRET', 'cron-secret');
    setEnv('PREVIEW_SECRET', 'preview-secret');
    setEnv('BASE_URL', 'https://api.flavor.test');
    setEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'bucket');
  });

  afterEach(() => {
    restoreEnv(originalEnv);
  });

  it("derives NEXT_PUBLIC_BASE_URL for preview deployments", async () => {
    setEnv('VERCEL_ENV', 'preview');
    setEnv('VERCEL_URL', 'preview.flavor.test');
    setNodeEnv("production");

    await import("../env/server-validation");

    expect(process.env.NEXT_PUBLIC_BASE_URL).toBe(
      "https://preview.flavor.test",
    );
  });

  it("falls back to localhost in development", async () => {
    setNodeEnv("development");

    await import("../env/server-validation");

    expect(process.env.NEXT_PUBLIC_BASE_URL).toBe("http://localhost:3000");
  });

  it("skips validation when ADMIN_BYPASS is enabled", async () => {
    setEnv('ADMIN_BYPASS', 'true');
    setEnv('BASE_URL', undefined);
    setEnv('CRON_SECRET', undefined);
    setEnv('PREVIEW_SECRET', undefined);
    setEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', undefined);

    await expect(import("../env/server-validation")).resolves.toBeDefined();
  });
});