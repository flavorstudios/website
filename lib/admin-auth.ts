import "server-only";

import type { NextRequest } from "next/server";
import { adminAuth, adminDb, ADMIN_BYPASS } from "@/lib/firebase-admin";
import {
  getAllowedAdminEmails,
  isEmailAllowed,
} from "@/lib/admin-allowlist";
import {
  normalizeEmail as normalizeEmailAddress,
  type NormalizedEmail,
} from "@/lib/email";
import { cookies } from "next/headers";
import { logError } from "@/lib/log";
import jwt from "jsonwebtoken";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { RolePermissions, UserRole } from "@/lib/role-permissions";
import { getUserRole } from "@/lib/user-roles";
import { serverEnv } from "@/env/server";
import { createHash } from "crypto";

const isE2E = process.env.E2E === "true" || process.env.E2E === "1";
const requireEmailVerification =
  !isE2E && serverEnv.ADMIN_REQUIRE_EMAIL_VERIFICATION === "true";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug =
  serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV !== "production";

const VALID_ROLE_NAMES = new Set<UserRole>([
  "admin" as UserRole,
  "editor" as UserRole,
  "support" as UserRole,
]);

type ClaimsRecord = Record<string, unknown>;

function normalizeEmailValue(email: unknown): NormalizedEmail | null {
  if (typeof email !== "string") {
    return null;
  }

  try {
    return normalizeEmailAddress(email);
  } catch {
    return null;
  }
}

function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase() as UserRole;
  return VALID_ROLE_NAMES.has(normalized) ? normalized : null;
}

function extractRoleFromClaims(claims: ClaimsRecord): UserRole | null {
  const directRole = normalizeRole(claims.role);
  if (directRole) return directRole;

  const rolesClaim = claims.roles;
  if (Array.isArray(rolesClaim)) {
    for (const value of rolesClaim) {
      const normalized = normalizeRole(value);
      if (normalized) {
        return normalized;
      }
    }
  } else if (rolesClaim && typeof rolesClaim === "object") {
    if ("primary" in rolesClaim) {
      const normalized = normalizeRole((rolesClaim as ClaimsRecord).primary);
      if (normalized) {
        return normalized;
      }
    }
    for (const [key, value] of Object.entries(rolesClaim)) {
      if (value === true) {
        const normalized = normalizeRole(key);
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  if (claims.admin === true || claims.isAdmin === true) {
    return "admin" as UserRole;
  }

  return null;
}

function hasAdminClaim(claims: ClaimsRecord): boolean {
  if (claims.admin === true || claims.isAdmin === true) {
    return true;
  }

  const directRole = normalizeRole(claims.role);
  if (directRole === "admin") {
    return true;
  }

  const rolesClaim = claims.roles;
  if (Array.isArray(rolesClaim)) {
    return rolesClaim.some((role) => normalizeRole(role) === "admin");
  }

  if (rolesClaim && typeof rolesClaim === "object") {
    if ((rolesClaim as ClaimsRecord).admin === true) {
      return true;
    }
    return Object.keys(rolesClaim).some(
      (role) => normalizeRole(role) === "admin" && (rolesClaim as ClaimsRecord)[role] === true
    );
  }

  return false;
}

function getRequestIp(req: NextRequest): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

// Combined flag to short-circuit all auth checks when either bypass is enabled
// or auth is explicitly disabled via environment variable.
export const DISABLE_AUTH =
  ADMIN_BYPASS || serverEnv.ADMIN_AUTH_DISABLED === "1" || isE2E;

// Fetch admin emails from Firestore's admin_users collection (lowercased, trimmed).
const firestoreAdminCache: {
  emails: NormalizedEmail[];
  expiresAt: number;
} = {
  emails: [],
  expiresAt: 0,
};

async function getFirestoreAdminEmails(): Promise<NormalizedEmail[]> {
  const now = Date.now();
  if (firestoreAdminCache.expiresAt > now && firestoreAdminCache.emails.length) {
    return firestoreAdminCache.emails;
  }

  try {
    if (!adminDb) {
      if (debug) {
        console.warn(
          "[admin-auth] adminDb unavailable; skipping Firestore admin_users lookup."
        );
      }
      firestoreAdminCache.emails = [];
      firestoreAdminCache.expiresAt = now + 30_000;
      return firestoreAdminCache.emails;
    }
    const snap = await adminDb.collection("admin_users").get();
    firestoreAdminCache.emails = snap.docs
      .map((d) => normalizeEmailValue(d.data().email))
      .filter((value): value is NormalizedEmail => value !== null);
    firestoreAdminCache.expiresAt = now + 30_000;
    return firestoreAdminCache.emails;
  } catch (err) {
    logError("admin-auth: fetch admin_users", err);
    firestoreAdminCache.emails = [];
    firestoreAdminCache.expiresAt = now + 15_000;
    return firestoreAdminCache.emails;
  }
}

interface AuthorizationResult {
  allowed: boolean;
  role: UserRole;
  reason: "claim" | "allowlist" | "role" | "none";
}

async function resolveAdminAuthorization(
  decoded: jwt.JwtPayload | DecodedIdToken,
  firestoreEmails: string[]
): Promise<AuthorizationResult> {
  const claims = decoded as ClaimsRecord;
  const claimRole = extractRoleFromClaims(claims);
  const claimAllows = hasAdminClaim(claims);
  const email = normalizeEmailValue(decoded.email);
  const allowlistAllows = email ? isEmailAllowed(email, firestoreEmails) : false;

  if (!claimAllows && !allowlistAllows) {
    return { allowed: false, role: "support" as UserRole, reason: "none" };
  }

  if (claimRole) {
    return { allowed: true, role: claimRole, reason: claimAllows ? "claim" : "role" };
  }

  if (decoded.uid) {
    const resolvedRole = await getUserRole(decoded.uid as string, decoded.email as string, {
      claimRole,
      fallbackRole: allowlistAllows ? ("admin" as UserRole) : ("support" as UserRole),
    });
    return {
      allowed: true,
      role: resolvedRole,
      reason: allowlistAllows ? "allowlist" : "role",
    };
  }

  return {
    allowed: true,
    role: allowlistAllows ? ("admin" as UserRole) : ("support" as UserRole),
    reason: allowlistAllows ? "allowlist" : "role",
  };
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
  if (DISABLE_AUTH) {
    if (debug)
      console.warn(
        "[admin-auth] DISABLE_AUTH=true — skipping verification."
      );
    return bypassAdmin();
  }

  if (!sessionCookie) {
    logError("admin-auth: verifyAdminSession (no cookie)", "No session cookie");
    throw new Error("No session cookie");
  }

  let decoded:
    | jwt.JwtPayload
    | DecodedIdToken
    | null = null;
  let firestoreEmails: string[] = [];

  if (!adminAuth && debug) {
    console.warn(
      "[admin-auth] Admin SDK unavailable; set FIREBASE_SERVICE_ACCOUNT_KEY"
    );
  }

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
    const secret = serverEnv.ADMIN_JWT_SECRET;
    if (!secret) {
      const err = new Error("Missing ADMIN_JWT_SECRET");
      logError("admin-auth: verifyAdminSession (missing secret)", err);
      throw err;
    }
    try {
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

  const authz = await resolveAdminAuthorization(decoded, firestoreEmails);

  if (!authz.allowed) {
    logError(
      "admin-auth: verifyAdminSession (unauthorized email)",
      decoded.email || ""
    );
    throw new Error("Unauthorized admin email");
  }

  if (debug) {
    console.log(
      "[admin-auth] Session authorized for email:",
      normalizeEmailValue(decoded.email)
    );
    console.log(
      "[admin-auth] Authorization source:",
      authz.reason
    );
    if (!adminAuth) {
      console.log(
        "[admin-auth] Allowed emails after merging:",
        [...getAllowedAdminEmails(), ...firestoreEmails].map((e) => `"${e}"`)
      );
    }
  }

  return { ...(decoded as jwt.JwtPayload), role: authz.role } as VerifiedAdmin;
}

// Returns the decoded admin session and role (or null if verification fails).
export async function getSessionAndRole(
  req: NextRequest
): Promise<VerifiedAdmin | null> {
  if (DISABLE_AUTH) {
    if (debug)
      console.warn(
        "[admin-auth] DISABLE_AUTH=true — returning bypass session."
      );
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
  if (DISABLE_AUTH) {
    if (debug)
      console.warn(
        "[admin-auth] DISABLE_AUTH=true — returning bypass session."
      );
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
  permission?: keyof RolePermissions
): Promise<boolean> {
  if (DISABLE_AUTH) {
    if (debug)
      console.warn(
        "[admin-auth] DISABLE_AUTH=true — requireAdmin returns true."
      );
    return true;
  }

  const sessionCookie = req.cookies.get("admin-session")?.value;
  if (!sessionCookie) return false;
  try {
    const decoded = await verifyAdminSession(sessionCookie);
    if (requireEmailVerification) {
      const emailVerified =
        (decoded as { email_verified?: boolean }).email_verified ??
        (decoded as { emailVerified?: boolean }).emailVerified ?? false;
      if (!emailVerified) {
        await logAdminAuditFailure(
          (decoded.email as string) || null,
          getRequestIp(req),
          "email-unverified"
        );
        return false;
      }
    }
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
  permission?: keyof RolePermissions
): Promise<boolean> {
  if (DISABLE_AUTH) {
    if (debug)
      console.warn(
        "[admin-auth] DISABLE_AUTH=true — requireAdminAction returns true."
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
    if (requireEmailVerification) {
      const emailVerified =
        (decoded as { email_verified?: boolean }).email_verified ??
        (decoded as { emailVerified?: boolean }).emailVerified ?? false;
      if (!emailVerified) {
        await logAdminAuditFailure(
          (decoded.email as string) || null,
          "unknown",
          "email-unverified"
        );
        return false;
      }
    }
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
  if (DISABLE_AUTH) {
    if (debug)
      console.warn(
        "[admin-auth] DISABLE_AUTH=true — returning fake session cookie."
      );
    const cookieStore = await cookies();
    cookieStore.set("admin-session", "bypass", {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
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

    const authz = await resolveAdminAuthorization(decoded, firestoreEmails);
    if (!authz.allowed) {
      logError(
        "admin-auth: createSessionCookieFromIdToken (unauthorized email)",
        decoded.email || ""
      );
      throw new Error("Unauthorized admin email");
    }
    if (debug) {
      console.log(
        "[admin-auth] Session cookie allowed via:",
        authz.reason
      );
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
      secure: serverEnv.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
    cookieStore.set("admin-refresh-token", "bypass-refresh", {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
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
    const apiKey = serverEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "";
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

    // Hash the refresh token so Firestore never stores the raw value.
    // Hashed tokens mitigate exposure if Firestore is compromised.
    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Persist hashed refresh token for later validation
    await adminDb
      .collection("refreshTokens")
      .doc(refreshTokenHash)
      .set({ uid, createdAt: new Date().toISOString() });

    // Set cookies (server context)
    const cookieStore = await cookies();
    cookieStore.set("admin-session", sessionCookie, {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
    cookieStore.set("admin-refresh-token", refreshToken, {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
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
