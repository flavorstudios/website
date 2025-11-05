"use client";

import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import {
  assertClientEnv,
  PUBLIC_FIREBASE_CONFIG,
  getMissingFirebaseEnv,
  formatMissingFirebaseEnvMessage,
} from "./firebase-client-env";

let app: FirebaseApp | null = null;
export let firebaseInitError: Error | null = null;

const buildFirebaseConfig = (): FirebaseOptions => {
  const missing = getMissingFirebaseEnv();
  if (missing.length > 0) {
    throw new Error(formatMissingFirebaseEnvMessage(missing));
  }

  const { measurementId, ...base } = PUBLIC_FIREBASE_CONFIG;

  const config: FirebaseOptions = {
    apiKey: base.apiKey,
    authDomain: base.authDomain,
    projectId: base.projectId,
    storageBucket: base.storageBucket,
    messagingSenderId: base.messagingSenderId,
    appId: base.appId,
  };

  if (typeof measurementId === "string" && measurementId.trim().length > 0) {
    config.measurementId = measurementId;
  }

  return config;
};

const ensureBrowserContext = (): void => {
  if (typeof window === "undefined") {
    throw new Error(
      "[Firebase] Client SDK should only be initialized in the browser context.",
    );
  }
};

function ensureFirebaseApp(): FirebaseApp {
  if (app) return app;

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
