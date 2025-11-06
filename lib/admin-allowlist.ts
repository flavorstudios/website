const TRUTHY_FLAGS = new Set(["1", "true", "yes"]);

export type AdminAllowlist = {
  configured: string[];
  extras: string[];
  merged: string[];
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const stripQuotes = (value: string): string => value.replace(/^['"]+|['"]+$/g, "");

const normalizeList = (values: string[]): string[] => {
  return Array.from(new Set(values.map(normalizeEmail).filter(Boolean))).sort();
};

function splitEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((entry) => stripQuotes(entry.trim()))
    .filter(Boolean);
}

function readConfiguredEmails(): string[] {
  const fromList = splitEmails(process.env.ADMIN_EMAILS);
  const single = splitEmails(process.env.ADMIN_EMAIL);
  return normalizeList([...fromList, ...single]);
}

function normalizeExtras(extraEmails: string[]): string[] {
  if (!extraEmails.length) return [];
  return normalizeList(extraEmails);
}

export function parseAdminAllowlist(extraEmails: string[] = []): AdminAllowlist {
  const configured = readConfiguredEmails();
  const extras = normalizeExtras(extraEmails);
  const merged = normalizeList([...configured, ...extras]);
  return { configured, extras, merged };
}

export const ALLOWLIST = parseAdminAllowlist();

export function getAllowedAdminEmails(extraEmails: string[] = []): string[] {
  return parseAdminAllowlist(extraEmails).merged;
}

export function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN ?? "";
  const normalized = domain.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  return TRUTHY_FLAGS.has(value.trim().toLowerCase());
}

export function isAdminBypassEnabled(): boolean {
  return (
    isTruthy(process.env.ADMIN_AUTH_DISABLED) ||
    isTruthy(process.env.ADMIN_BYPASS)
  );
}

export function isAdmin(
  email: string | null | undefined,
  extraEmails: string[] = [],
): boolean {
  if (isAdminBypassEnabled()) {
    return true;
  }
  if (!email) {
    return false;
  }
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const allowlist = parseAdminAllowlist(extraEmails);
  if (allowlist.merged.includes(normalized)) {
    return true;
  }

  const allowedDomain = getAllowedAdminDomain();
  if (allowedDomain && normalized.endsWith(`@${allowedDomain}`)) {
    return true;
  }

  return false;
}

export function describeAdminAllowlist(extraEmails: string[] = []): {
  configured: string[];
  extras: string[];
  merged: string[];
  domain: string | null;
  bypass: boolean;
} {
  const snapshot = parseAdminAllowlist(extraEmails);
  return {
    ...snapshot,
    domain: getAllowedAdminDomain(),
    bypass: isAdminBypassEnabled(),
  };
}