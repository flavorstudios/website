import {
  describeAdminAllowlist,
  getAllowedAdminDomain,
  getAllowedAdminEmails,
  isAdmin,
  isAdminBypassEnabled,
} from "../admin-allowlist";

describe("admin allowlist helpers", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it("normalizes emails from ADMIN_EMAILS and ADMIN_EMAIL", () => {
    process.env.ADMIN_EMAILS = "Admin@example.com second@example.com";
    process.env.ADMIN_EMAIL = "third@example.com";

    expect(getAllowedAdminEmails()).toEqual([
      "admin@example.com",
      "second@example.com",
      "third@example.com",
    ]);

    expect(isAdmin("admin@example.com")).toBe(true);
    expect(isAdmin("ADMIN@EXAMPLE.COM")).toBe(true);
    expect(isAdmin("missing@example.com")).toBe(false);
  });

  it("accepts comma and whitespace separators", () => {
    process.env.ADMIN_EMAILS = "first@example.com, second@example.com\nthird@example.com";

    expect(isAdmin("second@example.com")).toBe(true);
    expect(isAdmin("third@example.com")).toBe(true);
  });

  it("supports single ADMIN_EMAIL fallback", () => {

    delete process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAIL = "solo@example.com";

    expect(getAllowedAdminEmails()).toEqual(["solo@example.com"]);
    expect(isAdmin("solo@example.com")).toBe(true);
  });

  it("allows domain-based access when configured", () => {
    process.env.ADMIN_DOMAIN = "example.com";

    expect(getAllowedAdminDomain()).toBe("example.com");
    expect(isAdmin("user@example.com")).toBe(true);
    expect(isAdmin("other@test.com")).toBe(false);
  });

  it("only enables bypass when explicit flags are set", () => {
    delete process.env.ADMIN_EMAILS;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_DOMAIN;

    expect(isAdminBypassEnabled()).toBe(false);
    expect(isAdmin("any@example.com")).toBe(false);

    process.env.ADMIN_BYPASS = "1";
    expect(isAdminBypassEnabled()).toBe(false);

    process.env.ADMIN_BYPASS = "true";
    expect(isAdminBypassEnabled()).toBe(true);
    expect(isAdmin(null)).toBe(true);

    delete process.env.ADMIN_BYPASS;
    process.env.ADMIN_AUTH_DISABLED = "1";
    expect(isAdminBypassEnabled()).toBe(true);
    expect(isAdmin("other@example.com")).toBe(true);
  });

  it("describes configured allowlist for diagnostics", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    process.env.ADMIN_DOMAIN = "example.com";

    const info = describeAdminAllowlist(["firestore@example.com"]);
    expect(info.configured).toEqual(["admin@example.com"]);
    expect(info.extras).toEqual(["firestore@example.com"]);
    expect(info.merged).toEqual([
      "admin@example.com",
      "firestore@example.com",
    ]);
    expect(info.domain).toBe("example.com");
    expect(info.bypass).toBe(false);
    
  });
});