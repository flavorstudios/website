// lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  PUBLIC_FIREBASE_CONFIG,
  assertClientEnv,
  getMissingFirebaseEnv,
} from "./env";

/**
 * Firebase config for frontend (uses NEXT_PUBLIC_ variables only).
 * Now sourced from lib/env.ts with a single assertion point.
 */
assertClientEnv();

const isBrowser = typeof window !== "undefined";

export let firebaseInitError: Error | null = null;
let app: ReturnType<typeof initializeApp> | null = null;

if (isBrowser) {
  // List any missing environment variables by their actual names for clear feedback.
  const missingKeys = getMissingFirebaseEnv();

  if (missingKeys.length > 0) {
    // Record the problem without throwing; callers can read firebaseInitError.
    firebaseInitError = new Error(
      `[Firebase] Missing Firebase environment variable(s): ${missingKeys.join(
        ", "
      )}. Check your environment (e.g., .env.local or hosting dashboard).`
    );
  } else {
    try {
      const options: FirebaseOptions = {
        apiKey: PUBLIC_FIREBASE_CONFIG.apiKey!,
        authDomain: PUBLIC_FIREBASE_CONFIG.authDomain!,
        projectId: PUBLIC_FIREBASE_CONFIG.projectId!,
        storageBucket: PUBLIC_FIREBASE_CONFIG.storageBucket!,
        messagingSenderId: PUBLIC_FIREBASE_CONFIG.messagingSenderId!,
        appId: PUBLIC_FIREBASE_CONFIG.appId!,
      };
      app = getApps().length ? getApp() : initializeApp(options);
    } catch (err) {
      firebaseInitError = err as Error;
      app = null;
    }
  }
}

export default app;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
