// lib/admin-auth.ts

import { NextRequest } from "next/server";
import { adminAuth, adminDb, getAllowedAdminEmails } from "@/lib/firebase-admin"; // <- Use the canonical function!
import { cookies } from "next/headers";
import { logError } from "@/lib/log"; // Consistent server logging
import jwt from "jsonwebtoken";
import type { UserRole } from "@/lib/role-permissions";
import { getUserRole } from "@/lib/user-roles";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = process.env.DEBUG_ADMIN === "true" || process.env.NODE_ENV !== "production";

/**
 * Parse allowed admin domain (from env)
 */
function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN || "";
  return domain ? domain.trim().toLowerCase() : null;
}

/**
 * Fetch admin emails from Firestore's admin_users collection (lowercased, trimmed).
 */
async function getFirestoreAdminEmails(): Promise<string[]> {
  try {
    const snap = await adminDb.collection("admin_users").get();
    return snap.docs
      .map((d) => (d.data().email || "").toLowerCase().trim())
      .filter(Boolean);
  } catch (err) {
    logError("admin-auth: fetch admin_users", err);
    return [];
  }
}

/**
 * Checks if an email is allowed as admin (case-insensitive).
 * Combines env and Firestore emails.
 */
function isEmailAllowed(email: string, extraEmails: string[] = []): boolean {
  if (!email) return false;
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();
  // --- NORMALIZE EMAIL, LOG FOR DEBUG ---
  const normalizedEmail = email.trim().toLowerCase();

  const combinedEmails = [...new Set([...allowedEmails, ...extraEmails])];

  // --- LOGS TO DEBUG EMAIL COMPARISON ---
  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[admin-auth] Normalized login email:", `"${normalizedEmail}"`);
    // eslint-disable-next-line no-console
    console.log("[admin-auth] Combined allowed emails:", combinedEmails.map(e => `"${e}"`));
  }

  if (combinedEmails.length && combinedEmails.includes(normalizedEmail)) {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[admin-auth] Allowed admin email:", normalizedEmail);
    }
    return true;
  }
  if (
    allowedDomain &&
    normalizedEmail.endsWith("@" + allowedDomain)
  ) {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[admin-auth] Allowed admin domain:", allowedDomain, "for email:", normalizedEmail);
    }
    return true;
  }
  if (debug) {
    // eslint-disable-next-line no-console
    console.warn("[admin-auth] Rejected admin email:", `"${normalizedEmail}"`, "(not in allowed list or domain)");
  }
  return false;
}

/**
 * Verifies the session cookie:
 * - Tries Firebase session first (Google login)
 * - If fails, tries JWT session (email/password login)
 * Returns decoded session PLUS the user's role.
 * Throws if invalid or unauthorized.
 */
export interface VerifiedAdmin {
  role: UserRole
  email?: string
  uid: string
  [key: string]: any
}

export async function verifyAdminSession(sessionCookie: string): Promise<VerifiedAdmin> {
  if (!sessionCookie) {
    logError("admin-auth: verifyAdminSession (no cookie)", "No session cookie");
    throw new Error("No session cookie");
  }
  let decoded: any;
  let firestoreEmails: string[] = [];
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[admin-auth] Session cookie verified for:", decoded.email);
    }
  } catch (err) {
    // Fallback: try JWT (for email/password logins)
    try {
      const secret = process.env.ADMIN_JWT_SECRET || "";
      decoded = jwt.verify(sessionCookie, secret);
      if (debug) {
        // eslint-disable-next-line no-console
        console.log("[admin-auth] JWT session verified for:", decoded.email);
      }
    } catch (jwtErr) {
      logError("admin-auth: verifyAdminSession (verify fail)", jwtErr);
      throw new Error("Session cookie invalid");
    }
  }

  // --- Firestore-based admin users ---
  firestoreEmails = await getFirestoreAdminEmails();

  // --- LOG BOTH EMAILS FOR DEBUG ---
  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[admin-auth] Email from session:", `"${decoded.email?.trim().toLowerCase()}"`);
    // eslint-disable-next-line no-console
    console.log("[admin-auth] Allowed emails after merging:", [...getAllowedAdminEmails(), ...firestoreEmails].map(e => `"${e}"`));
  }

  // --- Check env + Firestore merged ---
  if (!isEmailAllowed(decoded.email, firestoreEmails)) {
    logError("admin-auth: verifyAdminSession (unauthorized email)", decoded.email || "");
    throw new Error("Unauthorized admin email");
  }
  const role = await getUserRole(decoded.uid);
  return { ...(decoded as any), role } as VerifiedAdmin;
}

/**
 * Checks if the request has a valid admin session.
 * If a permission is passed, checks that the user's role includes that permission.
 */
export async function requireAdmin(
  req: NextRequest,
  permission?: keyof import("./role-permissions").RolePermissions,
): Promise<boolean> {
  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    const decoded = await verifyAdminSession(sessionCookie);
    if (permission) {
      const { hasPermission } = await import("@/lib/role-permissions");
      if (!hasPermission(decoded.role, permission)) {
        return false;
      }
    }
    return true;
  } catch (err) {
    logError("admin-auth: requireAdmin", err);
    return false;
  }
}

/**
 * Checks if the current server action context has a valid admin session.
 * Reads the session cookie using next/headers and validates as above.
 * Supports permission check.
 */
export async function requireAdminAction(
  permission?: keyof import("./role-permissions").RolePermissions,
): Promise<boolean> {
  const sessionCookie = cookies().get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    const decoded = await verifyAdminSession(sessionCookie);
    if (permission) {
      const { hasPermission } = await import("@/lib/role-permissions");
      if (!hasPermission(decoded.role, permission)) {
        return false;
      }
    }
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

    // --- Firestore-based admin users ---
    const firestoreEmails = await getFirestoreAdminEmails();

    // --- LOG FOR DEBUGGING EMAIL MATCH ---
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[admin-auth] Creating session cookie for email:", `"${decoded.email?.trim().toLowerCase()}"`);
      // eslint-disable-next-line no-console
      console.log("[admin-auth] Allowed emails:", [...getAllowedAdminEmails(), ...firestoreEmails].map(e => `"${e}"`));
    }

    if (!isEmailAllowed(decoded.email, firestoreEmails)) {
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
