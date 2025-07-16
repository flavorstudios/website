// lib/admin-auth.ts

import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

/**
 * Parse allowed admin emails from env (comma-separated) or admin domain.
 */
function getAllowedAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return emails.split(",").map((email) => email.trim()).filter(Boolean);
}

function getAllowedAdminDomain(): string | null {
  return process.env.ADMIN_DOMAIN || null;
}

/**
 * Checks if an email is allowed as admin.
 */
function isEmailAllowed(email: string): boolean {
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();

  if (allowedEmails.length && allowedEmails.includes(email)) {
    return true;
  }
  if (allowedDomain && email.endsWith(`@${allowedDomain}`)) {
    return true;
  }
  return false;
}

/**
 * Verifies the Firebase session cookie and checks admin email(s)/domain.
 * Throws if invalid or unauthorized.
 */
export async function verifyAdminSession(sessionCookie: string): Promise<any> {
  if (!sessionCookie) throw new Error("No session cookie");
  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!isEmailAllowed(decoded.email)) throw new Error("Unauthorized admin email");
  return decoded;
}

/**
 * Checks if the request has a valid admin session.
 * Use this at the top of any protected admin API route.
 */
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    await verifyAdminSession(sessionCookie);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the current server action context has a valid admin session.
 * Reads the session cookie using next/headers and validates as above.
 */
export async function requireAdminAction(): Promise<boolean> {
  const sessionCookie = cookies().get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    await verifyAdminSession(sessionCookie);
    return true;
  } catch {
    return false;
  }
}
