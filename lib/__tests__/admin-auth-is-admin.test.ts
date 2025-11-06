describe("isAdmin helper", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
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
    process.env.ADMIN_EMAILS = "Admin@example.com";
    const { isAdmin } = await loadModule();
    expect(isAdmin("admin@example.com")).toBe(true);
    expect(isAdmin("ADMIN@EXAMPLE.COM")).toBe(true);
    expect(isAdmin("other@example.com")).toBe(false);
  });

  it("splits whitespace-separated lists", async () => {
    process.env.ADMIN_EMAILS = "first@example.com second@example.com";
    const { isAdmin } = await loadModule();
    expect(isAdmin("second@example.com")).toBe(true);
  });

  it("falls back to ADMIN_EMAIL when list is missing", async () => {
    delete process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAIL = "solo@example.com";
    const { isAdmin } = await loadModule();
    expect(isAdmin("solo@example.com")).toBe(true);
    expect(isAdmin("other@example.com")).toBe(false);
  });

  it("allows extra emails provided at runtime", async () => {
    process.env.ADMIN_EMAILS = "first@example.com";
    const { isAdmin } = await loadModule();
    expect(isAdmin("firestore@example.com", ["firestore@example.com"])).toBe(
      true,
    );
  });

  it("respects bypass flags", async () => {
    process.env.ADMIN_EMAILS = "";
    process.env.ADMIN_AUTH_DISABLED = "1";
    const { isAdmin } = await loadModule();
    expect(isAdmin(null)).toBe(true);
    expect(isAdmin("anyone@example.com")).toBe(true);
  });
});