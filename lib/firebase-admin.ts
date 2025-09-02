// lib/firebase-admin.ts
import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin"; // Strict type import
import { serverEnv } from "@/env/server";

// Allow e2e/CI to short-circuit any admin boot (actual auth bypass is implemented in lib/admin-auth.ts)
export const ADMIN_BYPASS = serverEnv.ADMIN_BYPASS === "true";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV !== "production";

// === EARLY LOGS FOR ENV DEBUGGING ===
if (debug) {
  console.log("[ENV] ADMIN_EMAIL:", serverEnv.ADMIN_EMAIL);
  console.log("[ENV] ADMIN_EMAILS:", serverEnv.ADMIN_EMAILS);
}

// 🔐 Retrieve the service account JSON from env
// Prefer FIREBASE_SERVICE_ACCOUNT_KEY but allow FIREBASE_SERVICE_ACCOUNT_JSON as an alias
const serviceAccountJson =
  serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY || serverEnv.FIREBASE_SERVICE_ACCOUNT_JSON;

// Accept ADMIN_EMAILS if it contains a real value; otherwise fall back to ADMIN_EMAIL
const rawEmails = (serverEnv.ADMIN_EMAILS ?? "").trim();
export const adminEmailsEnv = rawEmails !== "" ? rawEmails : serverEnv.ADMIN_EMAIL;

// ======= ENVIRONMENT VARIABLE VALIDATION =======

// If missing, warn and export undefined. Do NOT throw!
let parsedCredentials: ServiceAccount | null = null;

// If we're in bypass mode, skip any initialization work entirely.
if (ADMIN_BYPASS) {
  if (debug) console.warn("[Firebase Admin] ADMIN_BYPASS=true — skipping Admin SDK initialization.");
} else if (!serviceAccountJson) {
  if (debug) {
    console.warn(
      "[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY/FIREBASE_SERVICE_ACCOUNT_JSON not set. Admin features are disabled."
    );
  }
} else {
  try {
    parsedCredentials = JSON.parse(serviceAccountJson) as ServiceAccount;
    // 🛡 Initialize Firebase Admin SDK (only once)
    if (!getApps().length) {
      // Pass storageBucket from env, fallback to NEXT_PUBLIC for local/dev
      initializeApp({
        credential: cert(parsedCredentials),
        storageBucket:
          serverEnv.FIREBASE_STORAGE_BUCKET ||
          serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      if (debug) {
        console.log("[Firebase Admin] Firebase Admin initialized successfully.");
        console.log(
          "[Firebase Admin] Using storage bucket:",
          serverEnv.FIREBASE_STORAGE_BUCKET || serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        );
      }
    }
  } catch (error) {
    console.error(
      "[Firebase Admin] Failed to parse Firebase service account JSON:",
      error
    );
    // Don't throw, just disable admin features!
    parsedCredentials = null;
  }
}

if (debug) {
  if (!adminEmailsEnv && !ADMIN_BYPASS) {
    console.warn("[Firebase Admin] Warning: ADMIN_EMAIL or ADMIN_EMAILS environment variable is missing. Admin routes will deny all access!");
  }
  console.log("[Firebase Admin] STARTUP Loaded ADMIN_EMAILS/ADMIN_EMAIL:", adminEmailsEnv);
}

/**
 * Helper: Get allowed admin emails as a lowercase array
 */
export const getAllowedAdminEmails = (): string[] => {
  const allowedEmails = (adminEmailsEnv || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (debug) {
    console.log("[Firebase Admin] DEBUG_ADMIN enabled");
    console.log("[Firebase Admin] Loaded ADMIN_EMAILS:", serverEnv.ADMIN_EMAILS);
    console.log("[Firebase Admin] Loaded ADMIN_EMAIL:", serverEnv.ADMIN_EMAIL);
    console.log("[Firebase Admin] Final allowed admin emails:", allowedEmails);
    console.log(
      "[ENV DUMP]",
      JSON.stringify(
        {
          ADMIN_EMAIL: serverEnv.ADMIN_EMAIL,
          ADMIN_EMAILS: serverEnv.ADMIN_EMAILS,
          NODE_ENV: serverEnv.NODE_ENV,
          ADMIN_BYPASS,
        },
        null,
        2
      )
    );
  }
  return allowedEmails;
};

// ✅ Export Firebase Admin Services - export undefined if not initialized OR if bypassing
export const adminAuth: Auth | undefined =
  !ADMIN_BYPASS && serviceAccountJson && parsedCredentials ? getAuth() : undefined;

export const adminDb: Firestore | undefined =
  !ADMIN_BYPASS && serviceAccountJson && parsedCredentials ? getFirestore() : undefined;

/** Quick status helper (never throws) */
export function isAdminSdkAvailable(): boolean {
  return !!adminAuth && !!adminDb;
}

/**
 * Safe getter for adminAuth that throws with a clear error if unavailable.
 * Use for type-safety and DX.
 */
export function getAdminAuth(): Auth {
  if (!adminAuth)
    throw new Error(
      "Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY/FIREBASE_SERVICE_ACCOUNT_JSON missing/invalid or ADMIN_BYPASS enabled."
    );
}

/**
 * Safe getter for adminDb that throws with a clear error if unavailable.
 * Use for type-safety and DX.
 */
export function getAdminDb(): Firestore {
  if (!adminDb)
    throw new Error(
      "Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY/FIREBASE_SERVICE_ACCOUNT_JSON missing/invalid or ADMIN_BYPASS enabled."
    );
}

/* ------------------------------------------------------------------ */
/* Back-compat aliases (fixes imports expecting `safeAdminDb/Auth`)   */
/* ------------------------------------------------------------------ */
export const safeAdminDb = adminDb;
export const safeAdminAuth = adminAuth;
