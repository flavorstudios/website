import { serverEnv } from "@/env/server";
import {
  buildEmailSet,
  normalizeEmail,
  splitEmailList,
  type NormalizedEmail,
} from "@/lib/email";

const parseDomain = (value: string | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
};

export function getAllowedAdminEmails(): NormalizedEmail[] {
  const emails = splitEmailList(serverEnv.ADMIN_EMAILS);
  const single = serverEnv.ADMIN_EMAIL
    ? [normalizeEmail(serverEnv.ADMIN_EMAIL)]
    : [];
  return Array.from(buildEmailSet(emails, single));
}

export function getAllowedAdminDomain(): string | null {
  return parseDomain(serverEnv.ADMIN_DOMAIN);
}

export function isEmailAllowed(
  email: string,
  extraEmails: NormalizedEmail[] = [],
): boolean {
  if (!email) {
    return false;
  }
  
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();
  const normalized = normalizeEmail(email);
  const combinedEmails = Array.from(
    buildEmailSet(allowedEmails, extraEmails),
  );

  if (combinedEmails.length > 0 && combinedEmails.includes(normalized)) {
    return true;
  }

  return allowedDomain !== null && normalized.endsWith(`@${allowedDomain}`);
}