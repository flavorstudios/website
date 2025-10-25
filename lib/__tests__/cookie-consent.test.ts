import { isAllowedDomain, shouldShowCookieConsent } from "@/lib/cookie-consent";

describe("isAllowedDomain", () => {
  it("matches allowed domains regardless of port", () => {
    expect(isAllowedDomain("example.com:3000", ["example.com"]))
      .toBe(true);
    expect(isAllowedDomain("sub.example.com:8443", ["example.com"]))
      .toBe(true);
    expect(isAllowedDomain("localhost:3000", ["localhost"]))
      .toBe(true);
    expect(isAllowedDomain("[::1]:3000", ["[::1]"]))
      .toBe(true);
  });

  it("rejects hosts outside of the allow list", () => {
    expect(isAllowedDomain("malicious.com", ["example.com"]))
      .toBe(false);
  });
});

describe("shouldShowCookieConsent", () => {
  const baseOptions = {
    env: "preview",
    allowedDomains: ["example.com"],
    isAdminUser: false,
    hasConsent: false,
    pathname: "/",
  } as const;

  it("shows consent banner for allowed preview domains with port present", () => {
    expect(
      shouldShowCookieConsent({
        ...baseOptions,
        allowedDomains: [...baseOptions.allowedDomains],
        host: "preview.example.com:3000",
      }),
    ).toBe(true);
  });

  it("still hides consent when user already opted in", () => {
    expect(
      shouldShowCookieConsent({
        ...baseOptions,
        allowedDomains: [...baseOptions.allowedDomains],
        host: "preview.example.com:3000",
        hasConsent: true,
      }),
    ).toBe(false);
  });
});