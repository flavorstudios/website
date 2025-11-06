const TRUTHY_FLAGS = new Set(["1", "true"]);

export type AdminAllowlist = {
  configured: string[];
  extras: string[];
  merged: string[];
};

const normalizeEmail = (value: string): string =>
  value.replace(/^['"]+|['"]+$/g, "").trim().toLowerCase();

const splitEmails = (raw: string | undefined): string[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .flatMap((entry) => entry.split(/\s+/))
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
};

const dedupeAndSort = (values: string[]): string[] =>
  Array.from(new Set(values)).sort();

function readConfiguredEmails(): string[] {
  const combined = [
    ...splitEmails(process.env.ADMIN_EMAILS),
    ...splitEmails(process.env.ADMIN_EMAIL),
  ];
  return dedupeAndSort(combined);
}

const normalizeExtras = (extraEmails: string[]): string[] =>
  dedupeAndSort(extraEmails.map(normalizeEmail).filter(Boolean));

export function parseAdminAllowlist(extraEmails: string[] = []): AdminAllowlist {
  const configured = readConfiguredEmails();
  const extras = normalizeExtras(extraEmails);
  const merged = dedupeAndSort([...configured, ...extras]);
  return { configured, extras, merged };
}

export const ALLOWLIST = parseAdminAllowlist();

export function getAllowedAdminEmails(extraEmails: string[] = []): string[] {
  if (extraEmails.length === 0) {
    return ALLOWLIST.merged;
  }
  return parseAdminAllowlist(extraEmails).merged;
}

export function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN ?? "";
  const normalized = normalizeEmail(domain);
  return normalized.length > 0 ? normalized : null;
}

function isAdminBypassFlagEnabled(): boolean {
  const authDisabled = (process.env.ADMIN_AUTH_DISABLED ?? "").trim();
  const bypass = (process.env.ADMIN_BYPASS ?? "").trim();
  return authDisabled === "1" || bypass.toLowerCase() === "true";
}

export function isAdminBypassEnabled(): boolean {
  return isAdminBypassFlagEnabled();
}

export function isAdmin(
  email: string | null | undefined,
  extraEmails: string[] = [],
): boolean {
  if (isAdminBypassFlagEnabled()) {
    return true;
  }
  if (!email) {
    return false;
  }
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const allowlist = extraEmails.length
    ? parseAdminAllowlist(extraEmails)
    : ALLOWLIST;
  if (allowlist.merged.includes(normalized)) {
    return true;
  }

  const allowedDomain = getAllowedAdminDomain();
  return Boolean(allowedDomain && normalized.endsWith(`@${allowedDomain}`));
}

export function describeAdminAllowlist(extraEmails: string[] = []): {
  configured: string[];
  extras: string[];
  merged: string[];
  domain: string | null;
  bypass: boolean;
} {
  const snapshot = extraEmails.length
    ? parseAdminAllowlist(extraEmails)
    : ALLOWLIST;
  return {
    ...snapshot,
    domain: getAllowedAdminDomain(),
    bypass: isAdminBypassFlagEnabled(),
  };
}