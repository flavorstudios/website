// lib/env.ts

/**
 * Public Firebase config sourced from NEXT_PUBLIC_* environment variables.
 * These must be set in `.env.local` for local dev or in your hosting platform (e.g., Vercel).
 * Do not import any Node-only modules here.
 */
export const PUBLIC_FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Optional, used by analytics
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

/**
 * Returns the list of missing required Firebase environment variables (by env var name).
 * Measurement ID is optional and therefore not included in this check.
 */
export function getMissingFirebaseEnv(): string[] {
  const required = {
    NEXT_PUBLIC_FIREBASE_API_KEY: PUBLIC_FIREBASE_CONFIG.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: PUBLIC_FIREBASE_CONFIG.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: PUBLIC_FIREBASE_CONFIG.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: PUBLIC_FIREBASE_CONFIG.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: PUBLIC_FIREBASE_CONFIG.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: PUBLIC_FIREBASE_CONFIG.appId,
  } as const;

  return Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
}

/**
 * Dev-only warning helper. Safe in both server and browser contexts.
 */
export function assertClientEnv(): void {
  const missing = getMissingFirebaseEnv();
  if (missing.length > 0 && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[Firebase] Missing Firebase environment variable(s): ${missing.join(
        ", "
      )}. Check your environment (e.g., .env.local or hosting dashboard).`
    );
  }
}
