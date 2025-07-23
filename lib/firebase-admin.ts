// lib/firebase-admin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = process.env.DEBUG_ADMIN === "true" || process.env.NODE_ENV !== "production";

// === EARLY LOGS FOR ENV DEBUGGING ===
if (debug) {
  // eslint-disable-next-line no-console
  console.log("[ENV] ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  // eslint-disable-next-line no-console
  console.log("[ENV] ADMIN_EMAILS:", process.env.ADMIN_EMAILS);
}

// 🔐 Retrieve the service account JSON from env
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Accept ADMIN_EMAILS if it contains a real value; otherwise fall back to ADMIN_EMAIL
const rawEmails = (process.env.ADMIN_EMAILS ?? "").trim();
export const adminEmailsEnv = rawEmails !== "" ? rawEmails : process.env.ADMIN_EMAIL;

// ======= ENVIRONMENT VARIABLE VALIDATION =======
if (!serviceAccountKey) {
  if (debug) {
    // eslint-disable-next-line no-console
    console.error("[Firebase Admin] Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  }
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required.");
}

if (!adminEmailsEnv) {
  if (debug) {
    // eslint-disable-next-line no-console
    console.warn(
      "[Firebase Admin] Warning: ADMIN_EMAIL or ADMIN_EMAILS environment variable is missing. Admin routes will deny all access!"
    );
  }
  // Not throwing here, just warn (in dev)
}

// ✅ Parse service account credentials safely
let parsedCredentials;
try {
  parsedCredentials = JSON.parse(serviceAccountKey);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("[Firebase Admin] Failed to parse service account key.");
  throw error;
}

// 🛡 Initialize Firebase Admin SDK (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert(parsedCredentials),
  });
}

// ---- LOG ON STARTUP: current adminEmailsEnv (for diagnosis) ----
if (debug) {
  // eslint-disable-next-line no-console
  console.log("[Firebase Admin] STARTUP Loaded ADMIN_EMAILS/ADMIN_EMAIL:", adminEmailsEnv);
}

/**
 * Helper: Get allowed admin emails as a lowercase array
 * - Supports: 
 *    - ADMIN_EMAILS (comma-separated)
 *    - ADMIN_EMAIL (single email)
 */
export const getAllowedAdminEmails = (): string[] => {
  const allowedEmails = (adminEmailsEnv || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[Firebase Admin] DEBUG_ADMIN enabled");
    // eslint-disable-next-line no-console
    console.log("[Firebase Admin] Loaded ADMIN_EMAILS:", process.env.ADMIN_EMAILS);
    // eslint-disable-next-line no-console
    console.log("[Firebase Admin] Loaded ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    // eslint-disable-next-line no-console
    console.log("[Firebase Admin] Final allowed admin emails:", allowedEmails);
    // One-time dump of critical envs (for troubleshooting)
    // eslint-disable-next-line no-console
    console.log("[ENV DUMP]", JSON.stringify({
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
      NODE_ENV: process.env.NODE_ENV
    }, null, 2));
  }
  return allowedEmails;
};

// ✅ Export Firebase Admin Services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
