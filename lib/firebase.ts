// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Safely retrieves environment variables.
 * Logs errors in development if any required variable is missing.
 */
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(`[Firebase] Missing environment variable: ${key}`);
    }
    return ""; // Prevent crash by returning empty in dev
  }
  return value;
}

// ✅ Firebase config for frontend (uses NEXT_PUBLIC_ variables only)
const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// --- Enhanced: Throw an explicit error in production if any variable is missing
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  const msg = `[Firebase] Missing Firebase environment variable(s): ${missingKeys.join(", ")}. Check your environment.`;
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production") {
      // In prod: throw hard to avoid silent failure!
      throw new Error(msg);
    } else {
      // In dev: warn only
      // eslint-disable-next-line no-console
      console.warn(msg);
    }
  }
}

// ✅ Initialize Firebase only once (important for hot reload/dev)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export common services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
