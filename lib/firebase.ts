// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase config for frontend (uses NEXT_PUBLIC_ variables only)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
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

const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);

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
  app = null;
}

export default app;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
