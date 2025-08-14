// lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { PUBLIC_FIREBASE_CONFIG, assertClientEnv } from "./env";

/**
 * Firebase config for frontend (uses NEXT_PUBLIC_ variables only).
 * Now sourced from lib/env.ts with a single assertion point.
 */
assertClientEnv();

// List of required config keys for sanity check
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

const missingKeys = requiredKeys.filter(
  (key) => !PUBLIC_FIREBASE_CONFIG[key]
);

export let firebaseInitError: Error | null = null;
let app: ReturnType<typeof initializeApp> | null = null;

if (missingKeys.length > 0) {
  // Record the problem without throwing; callers can read firebaseInitError.
  firebaseInitError = new Error(
    `[Firebase] Missing Firebase environment variable(s): ${missingKeys.join(
      ", "
    )}. Check your environment (Vercel/Env file).`
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
    app = !getApps().length ? initializeApp(options) : getApp();
  } catch (err) {
    firebaseInitError = err as Error;
    app = null;
  }
}

export default app;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
