// lib/admin-auth.ts

import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
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
    console.log("[admin-auth] Allowed admin email:", normalizedEmail);
    return true;
  }
  if (
    allowedDomain &&
    normalizedEmail.endsWith("@" + allowedDomain)
  ) {
    console.log("[admin-auth] Allowed admin domain:", allowedDomain, "for email:", normalizedEmail);
    return true;
  }
  console.warn("[admin-auth] Rejected admin email:", normalizedEmail, "(not in allowed list or domain)");
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
    console.log("[admin-auth] Session cookie verified for:", decoded.email);
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
 * Helper: creates a new session cookie from an ID token (used for session refresh).
 * You must provide a valid Firebase ID token (from the client) and the desired expiration in ms.
 */
export async function createSessionCookieFromIdToken(idToken: string, expiresIn: number): Promise<string> {
  try {
    // Validate and decode token (throws if invalid/revoked)
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if (!isEmailAllowed(decoded.email)) {
      logError("admin-auth: createSessionCookieFromIdToken (unauthorized email)", decoded.email || "");
      throw new Error("Unauthorized admin email");
    }
    // Now create the session cookie
    return await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (err) {
    logError("admin-auth: createSessionCookieFromIdToken", err);
    throw err;
  }
}

/**
 * Logs failed admin validations to Firestore for auditing.
 * Call this from middleware or API routes on validation failure.
 */
export async function logAdminAuditFailure(
  email: string | null,
  ip: string
): Promise<void> {
  try {
    await adminDb.collection("admin_audit_logs").add({
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logError("admin-auth: logAdminAuditFailure", err);
  }
}
