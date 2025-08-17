import "server-only";

import { NextRequest } from "next/server";
import {
  adminAuth,
  adminDb,
  getAllowedAdminEmails,
  ADMIN_BYPASS,
} from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { logError } from "@/lib/log";
import jwt from "jsonwebtoken";
import type { UserRole } from "@/lib/role-permissions";
import { getUserRole } from "@/lib/user-roles";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug =
  process.env.DEBUG_ADMIN === "true" || process.env.NODE_ENV !== "production";

// Parse allowed admin domain from env
function getAllowedAdminDomain(): string | null {
  const domain = process.env.ADMIN_DOMAIN || "";
  return domain ? domain.trim().toLowerCase() : null;
}

// Fetch admin emails from Firestore's admin_users collection (lowercased, trimmed).
async function getFirestoreAdminEmails(): Promise<string[]> {
  try {
    if (!adminDb) {
      if (debug) {
        console.warn(
          "[admin-auth] adminDb unavailable; skipping Firestore admin_users lookup."
        );
      }
      return [];
    }
    const snap = await adminDb.collection("admin_users").get();
    return snap.docs
      .map((d) => (d.data().email || "").toLowerCase().trim())
      .filter(Boolean);
  } catch (err) {
    logError("admin-auth: fetch admin_users", err);
    return [];
  }
}

// Checks if an email is allowed as admin (case-insensitive). Combines env and Firestore emails.
function isEmailAllowed(email: string, extraEmails: string[] = []): boolean {
  if (!email) return false;
  const allowedEmails = getAllowedAdminEmails();
  const allowedDomain = getAllowedAdminDomain();
  const normalizedEmail = email.trim().toLowerCase();
  const combinedEmails = [...new Set([...allowedEmails, ...extraEmails])];

  if (debug) {
    console.log("[admin-auth] Normalized login email:", `"${normalizedEmail}"`);
    console.log(
      "[admin-auth] Combined allowed emails:",
      combinedEmails.map((e) => `"${e}"`)
    );
  }

  if (combinedEmails.includes(normalizedEmail)) {
    if (debug) console.log("[admin-auth] Allowed admin email:", normalizedEmail);
    return true;
  }
  if (allowedDomain && normalizedEmail.endsWith("@" + allowedDomain)) {
    if (debug)
      console.log(
        "[admin-auth] Allowed admin domain:",
        allowedDomain,
        "for email:",
        normalizedEmail
      );
    return true;
  }
  if (debug) {
    console.warn(
      "[admin-auth] Rejected admin email:",
      `"${normalizedEmail}"`,
      "(not in allowed list or domain)"
    );
  }
  return false;
}

export interface VerifiedAdmin {
  role: UserRole;
  email?: string;
  uid: string;
  [key: string]: unknown;
}

// --- BYPASS SHIM (for CI / Playwright) --------------------------------------
function bypassAdmin(): VerifiedAdmin {
  // Choose a stable “admin” role; adjust if your union differs.
  const role = "admin" as UserRole;
  return {
    uid: "bypass",
    email: "bypass@local",
    role,
    bypass: true,
  };
}

// Verifies the session cookie (Firebase or JWT) and checks admin status.
export async function verifyAdminSession(
  sessionCookie: string
): Promise<VerifiedAdmin> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn("[admin-auth] ADMIN_BYPASS=true — skipping verification.");
    return bypassAdmin();
  }

  if (!sessionCookie) {
    logError("admin-auth: verifyAdminSession (no cookie)", "No session cookie");
    throw new Error("No session cookie");
  }

  let decoded:
    | jwt.JwtPayload
    | import("firebase-admin").auth.DecodedIdToken
    | null = null;
  let firestoreEmails: string[] = [];

  // Try Firebase session cookie if Admin SDK is available
  if (adminAuth) {
    try {
      decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      if (debug) {
        console.log("[admin-auth] Session cookie verified for:", decoded.email);
      }
    } catch (e) {
      if (debug) console.warn("[admin-auth] verifySessionCookie failed; trying JWT.", e);
    }
  }

  // Fallback: try JWT (for email/password logins)
  if (!decoded) {
    try {
      const secret = process.env.ADMIN_JWT_SECRET || "";
      decoded = jwt.verify(sessionCookie, secret) as jwt.JwtPayload;
      if (debug) {
        console.log("[admin-auth] JWT session verified for:", decoded.email);
      }
    } catch (jwtErr) {
      logError("admin-auth: verifyAdminSession (verify fail)", jwtErr);
      throw new Error("Session cookie invalid");
    }
  }

  firestoreEmails = await getFirestoreAdminEmails();

  if (debug) {
    console.log(
      "[admin-auth] Email from session:",
      `"${decoded.email?.trim?.().toLowerCase?.()}"`
    );
    console.log(
      "[admin-auth] Allowed emails after merging:",
      [...getAllowedAdminEmails(), ...firestoreEmails].map((e) => `"${e}"`)
    );
  }

  if (!isEmailAllowed(decoded.email as string, firestoreEmails)) {
    logError(
      "admin-auth: verifyAdminSession (unauthorized email)",
      decoded.email || ""
    );
    throw new Error("Unauthorized admin email");
  }

  // Always pass BOTH uid and email for fallback admin role logic!
  const role = await getUserRole(decoded.uid as string, decoded.email as string);
  return { ...(decoded as jwt.JwtPayload), role } as VerifiedAdmin;
}

// Returns the decoded admin session and role (or null if verification fails).
export async function getSessionAndRole(
  req: NextRequest
): Promise<VerifiedAdmin | null> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn("[admin-auth] ADMIN_BYPASS=true — returning bypass session.");
    return bypassAdmin();
  }

  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return null;
  try {
    const verified = await verifyAdminSession(sessionCookie);
    if (debug) {
      console.log(
        "[admin-auth] session uid:",
        verified.uid,
        "role:",
        verified.role
      );
    }
    return verified;
  } catch (err) {
    logError("admin-auth:getSessionAndRole", err);
    return null;
  }
}

// NEW AUDIT-READY HELPER: Reads the admin-session cookie and returns verified session info or null.
export async function getSessionInfo(
  req: NextRequest
): Promise<VerifiedAdmin | null> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn("[admin-auth] ADMIN_BYPASS=true — returning bypass session.");
    return bypassAdmin();
  }

  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return null;
  try {
    return await verifyAdminSession(sessionCookie);
  } catch (err) {
    logError("admin-auth: getSessionInfo", err);
    return null;
  }
}

// Checks if the request has a valid admin session (and optional permission).
export async function requireAdmin(
  req: NextRequest,
  permission?: keyof import("./role-permissions").RolePermissions
): Promise<boolean> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn(
        "[admin-auth] ADMIN_BYPASS=true — requireAdmin returns true."
      );
    return true;
  }

  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    const decoded = await verifyAdminSession(sessionCookie);
    if (permission) {
      const { hasPermission } = await import("@/lib/role-permissions");
      if (!hasPermission(decoded.role, permission)) {
        if (debug) {
          console.warn(
            "[admin-auth] Permission denied:",
            permission,
            "for role:",
            decoded.role
          );
        }
        return false;
      }
    }
    return true;
  } catch (err) {
    logError("admin-auth: requireAdmin", err);
    return false;
  }
}

// Checks if the current server action context has a valid admin session (with optional permission).
export async function requireAdminAction(
  permission?: keyof import("./role-permissions").RolePermissions
): Promise<boolean> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn(
        "[admin-auth] ADMIN_BYPASS=true — requireAdminAction returns true."
      );
    return true;
  }

  // (1) Get the cookies instance
  const cookieStore = await cookies(); // App Router: cookies() may be Promise
  // (2) .get() is valid
  const sessionCookie = cookieStore.get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    const decoded = await verifyAdminSession(sessionCookie);
    if (permission) {
      const { hasPermission } = await import("@/lib/role-permissions");
      if (!hasPermission(decoded.role, permission)) {
        if (debug) {
          console.warn(
            "[admin-auth] Action permission denied:",
            permission,
            "for role:",
            decoded.role
          );
        }
        return false;
      }
    }
    return true;
  } catch (err) {
    logError("admin-auth: requireAdminAction", err);
    return false;
  }
}

// Helper: creates a new session cookie from an ID token (used for session refresh).
export async function createSessionCookieFromIdToken(
  idToken: string,
  expiresIn: number
): Promise<string> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn(
        "[admin-auth] ADMIN_BYPASS=true — returning fake session cookie."
      );
    const cookieStore = await cookies();
    cookieStore.set("admin-session", "bypass", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
    return "bypass";
  }

  try {
    if (!adminAuth) {
      throw new Error(
        "Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY missing/invalid."
      );
    }

    // Validate and decode token (throws if invalid/revoked)
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // Firestore-based admin users
    const firestoreEmails = await getFirestoreAdminEmails();

    if (debug) {
      // ---- THIS IS THE ONLY LINE CHANGED AS REQUESTED ----
      console.log(
        "[admin-auth] Creating session cookie for email:",
        `"${decoded.email?.trim()?.toLowerCase()}"`
      );
      // -----------------------------------------------------
      console.log(
        "[admin-auth] Allowed emails:",
        [...getAllowedAdminEmails(), ...firestoreEmails].map((e) => `"${e}"`)
      );
    }

    if (!isEmailAllowed(decoded.email as string, firestoreEmails)) {
      logError(
        "admin-auth: createSessionCookieFromIdToken (unauthorized email)",
        decoded.email || ""
      );
      throw new Error("Unauthorized admin email");
    }
    // Now create the session cookie
    return await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (err) {
    logError("admin-auth: createSessionCookieFromIdToken", err);
    throw err;
  }
}

// Logs failed admin validations to Firestore for auditing.
export async function logAdminAuditFailure(
  email: string | null,
  ip: string,
  reason?: string
): Promise<void> {
  try {
    if (!adminDb) {
      if (debug)
        console.warn(
          "[admin-auth] adminDb unavailable; skipping audit log write."
        );
      return;
    }
    await adminDb.collection("admin_audit_logs").add({
      email,
      ip,
      reason,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logError("admin-auth: logAdminAuditFailure", err);
  }
}

// === Codex Audit Addition: createRefreshSession ===

/**
 * Creates a new admin session and refresh token for the given UID.
 * Sets the session and refresh token cookies, and returns the new refresh token.
 */
export async function createRefreshSession(uid: string): Promise<string> {
  if (ADMIN_BYPASS) {
    if (debug)
      console.warn(
        "[admin-auth] ADMIN_BYPASS=true — setting fake session/refresh cookies."
      );
    const cookieStore = await cookies();
    cookieStore.set("admin-session", "bypass", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
    cookieStore.set("admin-refresh-token", "bypass-refresh", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return "bypass-refresh";
  }

  try {
    if (!adminAuth || !adminDb) {
      throw new Error(
        "Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY missing/invalid."
      );
    }

    const customToken = await adminAuth.createCustomToken(uid);

    // Exchange custom token for ID token and refresh token via Firebase REST API
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      logError("admin-auth:createRefreshSession signIn", data);
      throw new Error("Failed to sign in with custom token");
    }

    const idToken = data.idToken as string;
    const refreshToken = data.refreshToken as string;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 1000 * 60 * 60 * 2, // 2 hours
    });

    // Persist refresh token for later validation
    await adminDb
      .collection("refreshTokens")
      .doc(refreshToken)
      .set({ uid, createdAt: new Date().toISOString() });

    // Set cookies (server context)
    const cookieStore = await cookies();
    cookieStore.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
    cookieStore.set("admin-refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return refreshToken;
  } catch (err) {
    logError("admin-auth:createRefreshSession", err);
    throw err;
  }
}
