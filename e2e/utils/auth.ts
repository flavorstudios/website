import type { BrowserContext } from "@playwright/test";
import { getBaseHostname } from "./env";

const ADMIN_SESSION_COOKIE = {
  name: "admin-session",
  value: "playwright",
  path: "/",
  httpOnly: true,
  sameSite: "Lax" as const,
  secure: false,
};

/**
 * Sets the synthetic admin session cookie for the current base URL.
 * The domain must match the server hostname or Playwright will silently drop it in CI.
 */
export async function primeAdminSession(context: BrowserContext): Promise<void> {
  const hostname = getBaseHostname();
  const domains = new Set<string>([hostname]);

  // Preserve backwards compatibility for local runs that hit both localhost and 127.0.0.1.
  if (hostname !== "127.0.0.1") domains.add("127.0.0.1");
  if (hostname !== "localhost") domains.add("localhost");

  await context.addCookies(
    Array.from(domains).map((domain) => ({
      ...ADMIN_SESSION_COOKIE,
      domain,
    })),
  );
}