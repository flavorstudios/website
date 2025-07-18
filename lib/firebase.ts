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

// --- Enhanced: Instead of throwing, export error for UI handling ---
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);

export let firebaseInitError: Error | null = null;
let app: ReturnType<typeof initializeApp> | null = null;

try {
  if (missingKeys.length > 0) {
    throw new Error(
      `[Firebase] Missing Firebase environment variable(s): ${missingKeys.join(", ")}. Check your environment (Vercel/Env file).`
    );
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (err) {
  firebaseInitError = err as Error;
}

export default app;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
