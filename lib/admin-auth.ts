// lib/admin-auth.ts

import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { logError } from "@/lib/log"; // Consistent server logging

/**
 * Parse allowed admin emails from env (comma-separated) or admin domain.
 * All emails are normalized to lowercase for safe comparison.
 */
function getAllowedAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return emails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN || "";
  return domain ? domain.trim().toLowerCase() : null;
}

/**
 * Checks if an email is allowed as admin (case-insensitive).
 */
function isEmailAllowed(email: string): boolean {
  if (!email) return false;
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();
  const normalizedEmail = email.trim().toLowerCase();

  if (allowedEmails.length && allowedEmails.includes(normalizedEmail)) {
    return true;
  }
  if (
    allowedDomain &&
    normalizedEmail.endsWith("@" + allowedDomain)
  ) {
    return true;
  }
  return false;
}

/**
 * Verifies the Firebase session cookie and checks admin email(s)/domain.
 * Throws if invalid or unauthorized.
 */
export async function verifyAdminSession(sessionCookie: string): Promise<any> {
  if (!sessionCookie) {
    logError("admin-auth: verifyAdminSession (no cookie)", "No session cookie");
    throw new Error("No session cookie");
  }
  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (err) {
    logError("admin-auth: verifyAdminSession (verify fail)", err);
    throw new Error("Session cookie invalid");
  }
  if (!isEmailAllowed(decoded.email)) {
    logError("admin-auth: verifyAdminSession (unauthorized email)", decoded.email || "");
    throw new Error("Unauthorized admin email");
  }
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
  } catch (err) {
    logError("admin-auth: requireAdmin", err);
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
  } catch (err) {
    logError("admin-auth: requireAdminAction", err);
    return false;
  }
}

/**
 * Helper: creates a new session cookie for the given UID (used for session refresh).
 */
export async function createSessionCookie(uid: string, expiresIn: number): Promise<string> {
  try {
    // You must issue an ID token on the client before calling this.
    // For a refresh, you might first verify old session and re-authenticate.
    // Here, you should replace this logic as per your Firebase strategy.
    throw new Error("createSessionCookie is not yet implemented.");
    // Example placeholder:
    // return await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (err) {
    logError("admin-auth: createSessionCookie", err);
    throw err;
  }
}
