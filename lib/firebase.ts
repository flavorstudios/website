"use client";

import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { assertClientEnv } from "./firebase-client-env";

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

type FirebaseEnv = Record<RequiredEnvVar, string>;

let app: FirebaseApp | null = null;
export let firebaseInitError: Error | null = null;

const readFirebaseEnv = (): FirebaseEnv => {
  const values = Object.create(null) as FirebaseEnv;
  const missing: RequiredEnvVar[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim().length > 0) {
      values[key] = value;
    } else {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[Firebase] Missing env: ${missing.join(", ")}. Populate these NEXT_PUBLIC_* values in .env.local for development or your hosting provider (e.g. Vercel) before deploying.`,
    );
  }

  return values;
};

const buildFirebaseConfig = (): FirebaseOptions => {
  const env = readFirebaseEnv();

  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
      : {}),
  } satisfies FirebaseOptions;
};

const ensureBrowserContext = (): void => {
  if (typeof window === "undefined") {
    throw new Error(
      "[Firebase] Client SDK should only be initialized in the browser context.",
    );
  }
};

function ensureFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }

  if (firebaseInitError) {
    throw firebaseInitError;
  }

  ensureBrowserContext();
  assertClientEnv();

  try {
    const options = buildFirebaseConfig();
    app = getApps().length > 0 ? getApp() : initializeApp(options);
    firebaseInitError = null;
    return app;
  } catch (error) {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(String(error ?? "Firebase initialization failed"));
    firebaseInitError = normalizedError;
    throw normalizedError;
  }
}

export function getFirebaseApp(): FirebaseApp {
  return ensureFirebaseApp();
}

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getDb = (): Firestore => getFirestore(getFirebaseApp());
