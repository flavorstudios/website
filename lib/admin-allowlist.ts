import { serverEnv } from "@/env/server";

export function getAllowedAdminEmails(): string[] {
  const emails = serverEnv.ADMIN_EMAILS || serverEnv.ADMIN_EMAIL || "";
  const normalized = emails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
    return Array.from(new Set(normalized));
}

export function getAllowedAdminDomain(): string | null {
  const domain = serverEnv.ADMIN_DOMAIN || "";
  return domain ? domain.trim().toLowerCase() : null;
}

export function isEmailAllowed(
  email: string,
  extraEmails: string[] = []
): boolean {
  if (!email) return false;
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();
  const normalized = email.trim().toLowerCase();
  const combinedEmails = [...new Set([...allowedEmails, ...extraEmails])];
  if (combinedEmails.length && combinedEmails.includes(normalized)) return true;
  if (allowedDomain && normalized.endsWith("@" + allowedDomain)) return true;
  return false;
}
