import { shouldShowCookieConsent } from "@/lib/cookie-consent";

describe("shouldShowCookieConsent", () => {
  const allowedDomains = ["flavorstudios.in"];
  const baseOpts = {
    env: "production",
    host: "flavorstudios.in",
    pathname: "/",
    allowedDomains,
    isAdminUser: false,
    hasConsent: false,
  };

  test("shows on production public page with no consent", () => {
    expect(shouldShowCookieConsent(baseOpts)).toBe(true);
  });

  test("hides on admin route", () => {
    expect(
      shouldShowCookieConsent({ ...baseOpts, pathname: "/admin" })
    ).toBe(false);
  });

  test("uses default admin prefixes when none provided", () => {
    expect(
      shouldShowCookieConsent({
        ...baseOpts,
        pathname: "/admin/dashboard",
        adminPrefixes: [],
      }),
    ).toBe(false);
  });

  test("hides for admin user", () => {
    expect(
      shouldShowCookieConsent({ ...baseOpts, isAdminUser: true })
    ).toBe(false);
  });

  test("hides outside production and live domain", () => {
    expect(
      shouldShowCookieConsent({ ...baseOpts, env: "development", host: "localhost" })
    ).toBe(false);
  });

  test("hides when consent cookie present", () => {
    expect(
      shouldShowCookieConsent({ ...baseOpts, hasConsent: true })
    ).toBe(false);
  });
});