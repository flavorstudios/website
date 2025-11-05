/**
 * @jest-environment node
 */

jest.mock("../../env/defaults", () => ({
  applyDefaultEnv: jest.fn(() => []),
}));

describe("scripts/validate-env modes", () => {
  const originalEnv = { ...process.env };

  const serviceAccount = JSON.stringify({
    type: "service_account",
    project_id: "demo",
    private_key_id: "abc123",
    private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    client_email: "demo@demo.iam.gserviceaccount.com",
    client_id: "1234567890",
  });

  const baseEnv: NodeJS.ProcessEnv = {
    ...originalEnv,
    NODE_ENV: "development",
    VERCEL_ENV: "",
    CI: "false",
    BASE_URL: "http://localhost:3000",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    CRON_SECRET: "cron-secret",
    PREVIEW_SECRET: "preview-secret",
    ADMIN_JWT_SECRET: "jwt-secret",
    NEXT_PUBLIC_FIREBASE_API_KEY: "demo-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456:web:abc",
    FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
    FIREBASE_SERVICE_ACCOUNT_KEY: serviceAccount,
  } as NodeJS.ProcessEnv;

  const loadValidator = async () => {
    jest.resetModules();
    const mod = await import("../validate-env-core");
    return mod;
  };

  const runWithEnv = async (
    overrides: Partial<NodeJS.ProcessEnv>,
  ) => {
    process.env = { ...baseEnv, ...overrides } as NodeJS.ProcessEnv;
    const { runValidation } = await loadValidator();
    return runValidation();
  };

  afterEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    delete process.env.SKIP_STRICT_ENV;
    delete process.env.E2E;
  });

  it("enforces strict mode for preview builds", async () => {
    const summary = await runWithEnv({
      VERCEL_ENV: "preview",
      NODE_ENV: "production",
    });

    expect(summary.mode).toBe("strict");
    expect(summary.shouldFail).toBe(false);
  });

  it("defaults to relaxed mode in local development", async () => {
    const summary = await runWithEnv({});

    expect(summary.mode).toBe("relaxed");
    expect(summary.shouldFail).toBe(false);
  });

  it("bypasses fatal checks when SKIP_STRICT_ENV is set", async () => {
    const summary = await runWithEnv({
      SKIP_STRICT_ENV: "1",
      ADMIN_JWT_SECRET: "",
    });

    expect(summary.mode).toBe("bypass");
    expect(summary.shouldFail).toBe(false);
    expect(summary.missingRequired).toContain("ADMIN_JWT_SECRET");
  });
});