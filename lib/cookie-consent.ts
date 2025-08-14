export const DEFAULT_ADMIN_ROUTE_PREFIXES = [
  "/admin",
  "/wp-admin",
  "/dashboard",
  "/backend",
];

function normalizeHost(host: string): string {
  return host.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
}

export function isAdminRoute(path: string, prefixes: string[] = DEFAULT_ADMIN_ROUTE_PREFIXES): boolean {
  return prefixes.some((p) => path.startsWith(p));
}

export function isAllowedDomain(host: string, allowed: string[]): boolean {
  const h = host.toLowerCase();
  return allowed.some((d) => {
    const domain = normalizeHost(d);
    return h === domain || h.endsWith(`.${domain}`);
  });
}

export interface CookieConsentOptions {
  env: string;
  host: string;
  pathname: string;
  allowedDomains: string[];
  isAdminUser: boolean;
  hasConsent: boolean;
  adminPrefixes?: string[];
}

export function shouldShowCookieConsent({
  env,
  host,
  pathname,
  allowedDomains,
  isAdminUser,
  hasConsent,
  adminPrefixes = DEFAULT_ADMIN_ROUTE_PREFIXES,
}: CookieConsentOptions): boolean {
  const prefixes =
    adminPrefixes && adminPrefixes.length
      ? adminPrefixes
      : DEFAULT_ADMIN_ROUTE_PREFIXES;
  const envOk = env === "production" || isAllowedDomain(host, allowedDomains);
  if (!envOk) return false;
  if (isAdminRoute(pathname, prefixes)) return false;
  if (isAdminUser) return false;
  if (hasConsent) return false;
  return true;
}