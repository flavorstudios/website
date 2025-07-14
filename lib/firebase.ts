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
      console.error(`Missing environment variable: ${key}`);
    }
    return ""; // Prevent crash by returning empty
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

// ⚠️ Warn in dev if any key is missing
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.error(
      "[Firebase] One or more required Firebase environment variables are missing. " +
      "Check your .env.local and ensure all NEXT_PUBLIC_FIREBASE_* variables are set."
    );
  }
}

// ✅ Initialize Firebase only once (important for hot reload/dev)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Optional: export common services
export const auth = getAuth(app);
export const db = getFirestore(app);

// You can export `app` if needed elsewhere
export default app;
