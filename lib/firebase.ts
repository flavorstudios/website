// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";

// Strict runtime check for required env vars
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV !== "production") {
      // Log clear error for missing keys during local/dev
      // (In prod, fail silently to avoid leaking keys in error logs)
      // eslint-disable-next-line no-console
      console.error(`Missing environment variable: ${key}`);
    }
    return ""; // Still return empty to avoid crashing import
  }
  return value;
}

const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  if (typeof window !== "undefined") {
    // Display a user-friendly message in the browser console
    // eslint-disable-next-line no-console
    console.error(
      "[Firebase] One or more required Firebase environment variables are missing. " +
      "Check your .env.local or hosting environment and ensure all NEXT_PUBLIC_FIREBASE_* vars are defined."
    );
  }
}

// Only initialize app if not already initialized (prevents "app already exists" error in hot reload/dev)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;
