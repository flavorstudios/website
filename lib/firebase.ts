'use client';
// lib/firebase.ts
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import {
  PUBLIC_FIREBASE_CONFIG,
  assertClientEnv,
  formatMissingFirebaseEnvMessage,
  getMissingFirebaseEnv,
} from "./firebase-client-env";

const REQUIRED_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

type RequiredKey = (typeof REQUIRED_KEYS)[number];

let app: FirebaseApp | null = null;
export let firebaseInitError: Error | null = null;

function createMissingEnvError(missing: ReadonlyArray<RequiredKey>): Error {
  return new Error(formatMissingFirebaseEnvMessage([...missing]));
}

function resolveFirebaseConfig(): FirebaseOptions {
  assertClientEnv();

  const missing = getMissingFirebaseEnv().filter((key): key is RequiredKey =>
    (REQUIRED_KEYS as readonly string[]).includes(key),
  );

  if (missing.length > 0) {
    const error = createMissingEnvError(missing);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.message);
    }
    throw error;
  }

  return {
    apiKey: PUBLIC_FIREBASE_CONFIG.apiKey!,
    authDomain: PUBLIC_FIREBASE_CONFIG.authDomain!,
    projectId: PUBLIC_FIREBASE_CONFIG.projectId!,
    storageBucket: PUBLIC_FIREBASE_CONFIG.storageBucket!,
    messagingSenderId: PUBLIC_FIREBASE_CONFIG.messagingSenderId!,
    appId: PUBLIC_FIREBASE_CONFIG.appId!,
    ...(PUBLIC_FIREBASE_CONFIG.measurementId
      ? { measurementId: PUBLIC_FIREBASE_CONFIG.measurementId }
      : {}),
  } satisfies FirebaseOptions;
}

  function ensureFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }

  if (firebaseInitError) {
    throw firebaseInitError;
  }

  if (typeof window === "undefined") {
    throw new Error("[Firebase] Client SDK should only be initialized in the browser context.");
  }

  try {
    const options = resolveFirebaseConfig();
    app = getApps().length > 0 ? getApp() : initializeApp(options);
    firebaseInitError = null;
    return app;
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error ?? "Firebase initialization failed"));
    firebaseInitError = normalizedError;
    throw normalizedError;
  }
}

export function getFirebaseApp(): FirebaseApp {
  return ensureFirebaseApp();
}

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getDb = (): Firestore => getFirestore(getFirebaseApp());
