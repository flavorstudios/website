import {
  describeAdminAllowlist,
  getAllowedAdminDomain,
  getAllowedAdminEmails,
  isAdmin,
  isAdminBypassEnabled,
} from "../admin-allowlist";
import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';

describe("admin allowlist helpers", () => {
  const originalEnv = snapshotEnv([
    'ADMIN_EMAILS',
    'ADMIN_EMAIL',
    'ADMIN_DOMAIN',
    'ADMIN_BYPASS',
    'ADMIN_AUTH_DISABLED',
  ]);

  afterEach(() => {
    restoreEnv(originalEnv);
    jest.resetModules();
  });

  it("normalizes emails from ADMIN_EMAILS and ADMIN_EMAIL", () => {
    setEnv('ADMIN_EMAILS', "Admin@example.com second@example.com");
    setEnv('ADMIN_EMAIL', "third@example.com");

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
    setEnv('ADMIN_EMAILS', "first@example.com, second@example.com\nthird@example.com");

    expect(isAdmin("second@example.com")).toBe(true);
    expect(isAdmin("third@example.com")).toBe(true);
  });

  it("supports single ADMIN_EMAIL fallback", () => {
    setEnv('ADMIN_EMAILS', undefined);
    setEnv('ADMIN_EMAIL', "solo@example.com");

    expect(getAllowedAdminEmails()).toEqual(["solo@example.com"]);
    expect(isAdmin("solo@example.com")).toBe(true);
  });

  it("allows domain-based access when configured", () => {
    setEnv('ADMIN_DOMAIN', "example.com");

    expect(getAllowedAdminDomain()).toBe("example.com");
    expect(isAdmin("user@example.com")).toBe(true);
    expect(isAdmin("other@test.com")).toBe(false);
  });

  it("only enables bypass when explicit flags are set", () => {
    setEnv('ADMIN_EMAILS', undefined);
    setEnv('ADMIN_EMAIL', undefined);
    setEnv('ADMIN_DOMAIN', undefined);

    expect(isAdminBypassEnabled()).toBe(false);
    expect(isAdmin("any@example.com")).toBe(false);

    setEnv('ADMIN_BYPASS', "1");
    expect(isAdminBypassEnabled()).toBe(false);

    setEnv('ADMIN_BYPASS', "true");
    expect(isAdminBypassEnabled()).toBe(true);
    expect(isAdmin(null)).toBe(true);

    setEnv('ADMIN_BYPASS', undefined);
    setEnv('ADMIN_AUTH_DISABLED', "1");
    expect(isAdminBypassEnabled()).toBe(true);
    expect(isAdmin("other@example.com")).toBe(true);
  });

  it("describes configured allowlist for diagnostics", () => {
    setEnv('ADMIN_EMAILS', "admin@example.com");
    setEnv('ADMIN_DOMAIN', "example.com");

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