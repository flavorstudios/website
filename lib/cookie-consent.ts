export const DEFAULT_ADMIN_ROUTE_PREFIXES = [
  "/admin",
  "/wp-admin",
  "/dashboard",
  "/backend",
];

function normalizeHost(host: string): string {
  const trimmed = host.trim();
  if (!trimmed) {
    return "";
  }

  const attempts = new Set<string>();

  // Strings that already include a scheme can be parsed directly.
  attempts.add(trimmed);

  // Most host headers won't include a protocol, so try a standard http URL.
  attempts.add(trimmed.startsWith("//") ? `http:${trimmed}` : `http://${trimmed}`);

  // IPv6 host headers may omit square brackets. Wrap them so URL can parse.
  if (trimmed.includes(":") && !trimmed.includes(".") && !trimmed.includes("[")) {
    attempts.add(`http://[${trimmed}]`);
  }

  for (const candidate of attempts) {
    try {
      const url = new URL(candidate);
      if (url.hostname) {
        return url.hostname.toLowerCase();
      }
    } catch {
      // Try next candidate
    }
  }

  const withoutProto = trimmed
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  const withoutBrackets =
    withoutProto.startsWith("[") && withoutProto.endsWith("]")
      ? withoutProto.slice(1, -1)
      : withoutProto;

  return withoutBrackets.replace(/:\d+$/, "").toLowerCase();
}

export function isAdminRoute(path: string, prefixes: string[] = DEFAULT_ADMIN_ROUTE_PREFIXES): boolean {
  return prefixes.some((p) => path.startsWith(p));
}

export function isAllowedDomain(host: string, allowed: string[]): boolean {
  const h = normalizeHost(host);
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