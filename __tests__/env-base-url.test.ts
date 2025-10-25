/** @jest-environment node */

describe("server env bootstrap", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    process.env.CRON_SECRET = "cron-secret";
    process.env.PREVIEW_SECRET = "preview-secret";
    process.env.BASE_URL = "https://api.flavor.test";
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "bucket";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("derives NEXT_PUBLIC_BASE_URL for preview deployments", async () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "preview.flavor.test";
    process.env.NODE_ENV = "production";

    await import("../env/server-validation");

    expect(process.env.NEXT_PUBLIC_BASE_URL).toBe(
      "https://preview.flavor.test",
    );
  });

  it("falls back to localhost in development", async () => {
    process.env.NODE_ENV = "development";

    await import("../env/server-validation");

    expect(process.env.NEXT_PUBLIC_BASE_URL).toBe("http://localhost:3000");
  });

  it("skips validation when ADMIN_BYPASS is enabled", async () => {
    process.env.ADMIN_BYPASS = "true";
    delete process.env.BASE_URL;
    delete process.env.CRON_SECRET;
    delete process.env.PREVIEW_SECRET;
    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    await expect(import("../env/server-validation")).resolves.toBeDefined();
  });
});