import {
  getAllowedAdminEmails,
  getAllowedAdminDomain,
  isEmailAllowed,
} from "../admin-allowlist";

describe("admin allowlist helpers", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows specific emails from env", () => {
    process.env.ADMIN_EMAILS = "admin@example.com, second@example.com";
    delete process.env.ADMIN_EMAIL;
    expect(getAllowedAdminEmails()).toEqual([
      "admin@example.com",
      "second@example.com",
    ]);
    expect(isEmailAllowed("admin@example.com")).toBe(true);
    expect(isEmailAllowed("user@example.com")).toBe(false);

    delete process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAIL = "single@example.com";
    expect(getAllowedAdminEmails()).toEqual(["single@example.com"]);
    expect(isEmailAllowed("single@example.com")).toBe(true);
  });

  it("allows emails by domain", () => {
    process.env.ADMIN_EMAILS = "";
    delete process.env.ADMIN_EMAIL;
    process.env.ADMIN_DOMAIN = "example.com";
    expect(getAllowedAdminDomain()).toBe("example.com");
    expect(isEmailAllowed("user@example.com")).toBe(true);
    expect(isEmailAllowed("other@test.com")).toBe(false);
  });

  it("splits whitespace and commas", () => {
    process.env.ADMIN_EMAILS = "First@example.com second@example.com,third@example.com\nFOURTH@example.com";
    const allowed = getAllowedAdminEmails();
    expect(allowed).toEqual([
      "first@example.com",
      "second@example.com",
      "third@example.com",
      "fourth@example.com",
    ]);
    expect(isEmailAllowed("SECOND@EXAMPLE.COM")).toBe(true);
    expect(isEmailAllowed("missing@example.com")).toBe(false);
  });
});