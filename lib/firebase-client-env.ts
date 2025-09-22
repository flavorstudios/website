"use client";

import { FIREBASE_REQUIRED_ENV_VARS } from "./firebase-env";
import { clientEnv } from "@/env.client";
import type { ClientEnvShape } from "@/env.client";

/**
 * Public Firebase config sourced from NEXT_PUBLIC_* environment variables.
 * These must be set in `.env.local` for local dev or in your hosting platform (e.g., Vercel).
 * Do not import any Node-only modules here.
 */
export const PUBLIC_FIREBASE_CONFIG = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Optional, used by analytics
  measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

/**
 * Returns the list of missing required Firebase environment variables (by env var name).
 * Measurement ID is optional and therefore not included in this check.
 */
export function getMissingFirebaseEnv(): string[] {
  return FIREBASE_REQUIRED_ENV_VARS.filter(
    v =>
      v.startsWith("NEXT_PUBLIC_") &&
      clientEnv.isValueMissing(v as keyof ClientEnvShape)
  );
}

/**
 * Dev-only warning helper. Safe in both server and browser contexts.
 */
export function assertClientEnv(): void {
  const missing = getMissingFirebaseEnv();
  if (missing.length > 0 && clientEnv.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[Firebase] Missing Firebase environment variable(s): ${missing.join(", ")}. Check your environment (e.g., .env.local or hosting dashboard).`
    );
  }
}