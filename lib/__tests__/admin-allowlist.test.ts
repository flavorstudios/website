import { serverEnv } from "@/env/server";
import {
  getAllowedAdminEmails,
  getAllowedAdminDomain,
  isEmailAllowed,
} from "../admin-allowlist";

describe("admin allowlist helpers", () => {
  const originalEmails = serverEnv.ADMIN_EMAILS;
  const originalEmail = serverEnv.ADMIN_EMAIL;
  const originalDomain = serverEnv.ADMIN_DOMAIN;

  afterEach(() => {
    serverEnv.ADMIN_EMAILS = originalEmails;
    serverEnv.ADMIN_EMAIL = originalEmail;
    serverEnv.ADMIN_DOMAIN = originalDomain;
  });

  it("allows specific emails from env", () => {
    serverEnv.ADMIN_EMAILS = "admin@example.com, second@example.com";
    serverEnv.ADMIN_EMAIL = undefined;
    expect(getAllowedAdminEmails()).toEqual([
      "admin@example.com",
      "second@example.com",
    ]);
    expect(isEmailAllowed("admin@example.com")).toBe(true);
    expect(isEmailAllowed("user@example.com")).toBe(false);

    serverEnv.ADMIN_EMAILS = undefined;
    serverEnv.ADMIN_EMAIL = "single@example.com";
    expect(getAllowedAdminEmails()).toEqual(["single@example.com"]);
    expect(isEmailAllowed("single@example.com")).toBe(true);
  });

  it("allows emails by domain", () => {
    serverEnv.ADMIN_EMAILS = "";
    serverEnv.ADMIN_EMAIL = undefined;
    serverEnv.ADMIN_DOMAIN = "example.com";
    expect(getAllowedAdminDomain()).toBe("example.com");
    expect(isEmailAllowed("user@example.com")).toBe(true);
    expect(isEmailAllowed("other@test.com")).toBe(false);
  });
});