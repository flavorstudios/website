'use client';
// lib/firebase.ts
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  PUBLIC_FIREBASE_CONFIG,
  assertClientEnv,
  formatMissingFirebaseEnvMessage,
  getMissingFirebaseEnv,
} from "./firebase-client-env";

let app: FirebaseApp | null = null;
export let firebaseInitError: Error | null = null;
let hasLoggedMissingFirebaseEnv = false;

function initIfNeeded(): void {
  // Never initialize during SSR; only in the browser.
  if (typeof window === "undefined" || app) return;

  assertClientEnv();

  const missing = getMissingFirebaseEnv();
  if (missing.length) {
    const message = formatMissingFirebaseEnvMessage(missing);
    firebaseInitError = new Error(message);
    if (!hasLoggedMissingFirebaseEnv && process.env.NODE_ENV !== "production") {
      console.error(message);
      hasLoggedMissingFirebaseEnv = true;
    }
    return;
  }

  const options: FirebaseOptions = {
    apiKey: PUBLIC_FIREBASE_CONFIG.apiKey!,
    authDomain: PUBLIC_FIREBASE_CONFIG.authDomain!,
    projectId: PUBLIC_FIREBASE_CONFIG.projectId!,
    storageBucket: PUBLIC_FIREBASE_CONFIG.storageBucket!,
    messagingSenderId: PUBLIC_FIREBASE_CONFIG.messagingSenderId!,
    appId: PUBLIC_FIREBASE_CONFIG.appId!,
    ...(PUBLIC_FIREBASE_CONFIG.measurementId
      ? { measurementId: PUBLIC_FIREBASE_CONFIG.measurementId }
      : {}),
  };

  app = getApps().length ? getApp() : initializeApp(options);
}

export function getFirebaseApp(): FirebaseApp {
  initIfNeeded();
  if (!app) throw firebaseInitError ?? new Error("Firebase not initialized");
  return app;
}

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getDb = (): Firestore => getFirestore(getFirebaseApp());
