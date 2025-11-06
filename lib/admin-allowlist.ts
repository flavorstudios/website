const TRUTHY = new Set(["1", "true", "TRUE", "True"]);

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

function getRawAdminEmails(): string {
  const fromList = process.env.ADMIN_EMAILS ?? "";
  if (fromList.trim().length > 0) {
    return fromList;
  }
  const single = process.env.ADMIN_EMAIL ?? "";
  return single.trim();
}

function splitAdminEmails(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\s,]+/)
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
}

function normalizeExtraEmails(extraEmails: string[]): string[] {
  return extraEmails
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function getAllowedAdminEmails(): string[] {
  return splitAdminEmails(getRawAdminEmails());
}

export function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN ?? "";
  const normalized = domain.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function isEmailAllowed(
  email: string,
  extraEmails: string[] = []
): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();
  const combinedEmails = [
    ...new Set([...allowedEmails, ...normalizeExtraEmails(extraEmails)]),
  ];
  if (combinedEmails.length && combinedEmails.includes(normalized)) {
    return true;
  }
  if (allowedDomain && normalized.endsWith(`@${allowedDomain}`)) {
    return true;
  }
  return false;
}

export function isAdminBypassEnabled(): boolean {
  return (
    TRUTHY.has(process.env.ADMIN_AUTH_DISABLED ?? "") ||
    TRUTHY.has(process.env.ADMIN_BYPASS ?? "") ||
    TRUTHY.has(process.env.TEST_MODE ?? "") ||
    TRUTHY.has(process.env.E2E ?? "")
  );
}
