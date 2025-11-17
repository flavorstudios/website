import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';

describe("isAdmin helper", () => {
  const originalEnv = snapshotEnv([
    'ADMIN_EMAILS',
    'ADMIN_EMAIL',
    'ADMIN_BYPASS',
    'ADMIN_AUTH_DISABLED',
  ]);

  afterEach(() => {
    restoreEnv(originalEnv);
    jest.resetModules();
  });

  const loadModule = async () => {
    jest.doMock("@/lib/firebase-admin", () => ({
      adminAuth: undefined,
      adminDb: undefined,
      ADMIN_BYPASS: false,
    }));
    return await import("../admin-auth");
  };

  it("matches emails case-insensitively", async () => {
    setEnv('ADMIN_EMAILS', "Admin@example.com");
    const { isAdmin } = await loadModule();
    expect(isAdmin("admin@example.com")).toBe(true);
    expect(isAdmin("ADMIN@EXAMPLE.COM")).toBe(true);
    expect(isAdmin("other@example.com")).toBe(false);
  });

  it("splits whitespace-separated lists", async () => {
    setEnv('ADMIN_EMAILS', "first@example.com second@example.com");
    const { isAdmin } = await loadModule();
    expect(isAdmin("second@example.com")).toBe(true);
  });

  it("handles comma-separated lists with mixed casing and spaces", async () => {
    setEnv('ADMIN_EMAILS', "Admin@example.com, second@example.com , THIRD@EXAMPLE.COM");
    const { isAdmin } = await loadModule();
    expect(isAdmin("admin@example.com")).toBe(true);
    expect(isAdmin(" second@example.com ")).toBe(true);
    expect(isAdmin("third@example.com")).toBe(true);
  });

  it("trims spaces around inputs and allowlist entries", async () => {
    setEnv('ADMIN_EMAILS', " admin@example.com , second@example.com ");
    const { isAdmin } = await loadModule();
    expect(isAdmin("  admin@example.com  ")).toBe(true);
    expect(isAdmin("SECOND@EXAMPLE.COM ")).toBe(true);
  });

  it("falls back to ADMIN_EMAIL when list is missing", async () => {
    setEnv('ADMIN_EMAILS', undefined);
    setEnv('ADMIN_EMAIL', "solo@example.com");
    const { isAdmin } = await loadModule();
    expect(isAdmin("solo@example.com")).toBe(true);
    expect(isAdmin("other@example.com")).toBe(false);
  });

  it("allows extra emails provided at runtime", async () => {
    setEnv('ADMIN_EMAILS', "first@example.com");
    const { isAdmin } = await loadModule();
    expect(isAdmin("firestore@example.com", ["firestore@example.com"])).toBe(
      true,
    );
  });

  it("respects bypass flags", async () => {
    setEnv('ADMIN_EMAILS', "");
    setEnv('ADMIN_AUTH_DISABLED', "1");
    const { isAdmin } = await loadModule();
    expect(isAdmin(null)).toBe(true);
    expect(isAdmin("anyone@example.com")).toBe(true);
  });

  it("only treats ADMIN_BYPASS=true as bypass", async () => {
    setEnv('ADMIN_EMAILS', "");
    setEnv('ADMIN_BYPASS', "1");
    const firstLoad = await loadModule();
    expect(firstLoad.isAdmin("user@example.com")).toBe(false);

    jest.resetModules();
    setEnv('ADMIN_BYPASS', "true");
    const secondLoad = await loadModule();
    expect(secondLoad.isAdmin("user@example.com")).toBe(true);
  });
});