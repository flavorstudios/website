// lib/firebase-admin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// 🔐 Retrieve the service account JSON from env
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Supports both multi-admin (ADMIN_EMAILS) and single-admin (ADMIN_EMAIL)
const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL; // Accepts comma-separated or single

// ======= ENVIRONMENT VARIABLE VALIDATION =======
if (!serviceAccountKey) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[Firebase Admin] Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  }
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required.");
}

if (!adminEmailsEnv) {
  if (process.env.NODE_ENV !== "production") {
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

/**
 * Helper: Get allowed admin emails as a lowercase array
 * - Supports: 
 *    - ADMIN_EMAILS (comma-separated)
 *    - ADMIN_EMAIL (single email)
 */
export const getAllowedAdminEmails = (): string[] =>
  (adminEmailsEnv || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

// ✅ Export Firebase Admin Services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
