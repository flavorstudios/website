// lib/firebase-admin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// 🛡 Ensure FIREBASE_SERVICE_ACCOUNT_KEY is available (as JSON string)
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.error("[Firebase Admin] Missing FIREBASE_SERVICE_ACCOUNT_KEY in environment.");
}

// ✅ Parse the service account key safely
const parsedCredentials = serviceAccountKey
  ? JSON.parse(serviceAccountKey)
  : undefined;

// 🔐 Initialize Firebase Admin app if not already initialized
if (!getApps().length && parsedCredentials) {
  initializeApp({
    credential: cert(parsedCredentials),
  });
}

// ✅ Export admin services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
