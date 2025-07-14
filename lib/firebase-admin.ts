// lib/firebase-admin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// 🔐 Retrieve the service account JSON from env
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[Firebase Admin] Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  }
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required.");
}

// ✅ Parse safely
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

// ✅ Export Firebase Admin Services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
