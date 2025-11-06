const TRUTHY_FLAGS = new Set(["1", "true"]);

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const stripQuotes = (value: string): string => value.replace(/^['"]+|['"]+$/g, "");

function splitEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((entry) => stripQuotes(entry.trim()))
    .map((entry) => (entry ? normalizeEmail(entry) : ""))
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function readConfiguredEmails(): string[] {
  const fromList = splitEmails(process.env.ADMIN_EMAILS);
  const single = splitEmails(process.env.ADMIN_EMAIL);
  return unique([...fromList, ...single]);
}

function normalizeExtras(extraEmails: string[]): string[] {
  return unique(extraEmails.map((value) => normalizeEmail(value)).filter(Boolean));
}

export function getAllowedAdminEmails(extraEmails: string[] = []): string[] {
  const configured = readConfiguredEmails();
  const extras = normalizeExtras(extraEmails);
  return unique([...configured, ...extras]);
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

  const allowedEmails = getAllowedAdminEmails(extraEmails);
  if (allowedEmails.includes(normalized)) {
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
  domain: string | null;
  bypass: boolean;
} {
  const configured = readConfiguredEmails();
  const extras = normalizeExtras(extraEmails);
  return {
    configured,
    extras,
    domain: getAllowedAdminDomain(),
    bypass: isAdminBypassEnabled(),
  };
}