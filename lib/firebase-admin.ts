// lib/firebase-admin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = process.env.DEBUG_ADMIN === "true" || process.env.NODE_ENV !== "production";

// === EARLY LOGS FOR ENV DEBUGGING ===
if (debug) {
  console.log("[ENV] ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  console.log("[ENV] ADMIN_EMAILS:", process.env.ADMIN_EMAILS);
}

// 🔐 Retrieve the service account JSON from env
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Accept ADMIN_EMAILS if it contains a real value; otherwise fall back to ADMIN_EMAIL
const rawEmails = (process.env.ADMIN_EMAILS ?? "").trim();
export const adminEmailsEnv = rawEmails !== "" ? rawEmails : process.env.ADMIN_EMAIL;

// ======= ENVIRONMENT VARIABLE VALIDATION =======

// If missing, warn and export undefined. Do NOT throw!
let parsedCredentials: Record<string, unknown> | null = null;
if (!serviceAccountKey) {
  if (debug) {
    console.warn("[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY not set. Admin features are disabled.");
  }
} else {
  try {
    parsedCredentials = JSON.parse(serviceAccountKey);
    // 🛡 Initialize Firebase Admin SDK (only once)
    if (!getApps().length) {
      initializeApp({
        credential: cert(parsedCredentials as any),
      });
      if (debug) {
        console.log("[Firebase Admin] Firebase Admin initialized successfully.");
      }
    }
  } catch (error) {
    console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    // Don't throw, just disable admin features!
    parsedCredentials = null;
  }
}

if (debug) {
  if (!adminEmailsEnv) {
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
    console.log("[Firebase Admin] Loaded ADMIN_EMAILS:", process.env.ADMIN_EMAILS);
    console.log("[Firebase Admin] Loaded ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("[Firebase Admin] Final allowed admin emails:", allowedEmails);
    console.log("[ENV DUMP]", JSON.stringify({
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
      NODE_ENV: process.env.NODE_ENV
    }, null, 2));
  }
  return allowedEmails;
};

// ✅ Export Firebase Admin Services - export undefined if not initialized!
export const adminAuth = serviceAccountKey && parsedCredentials ? getAuth() : undefined;
export const adminDb = serviceAccountKey && parsedCredentials ? getFirestore() : undefined;
