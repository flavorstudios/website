import { z } from "zod";

/**
 * Mapping of Firebase config keys to their required environment variable names.
 * These names must exist in `.env.local` (for local dev) or your hosting platform.
 */
export const FIREBASE_CLIENT_ENV_KEYS = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const;

const clientEnvSchema = z.object(
  Object.fromEntries(
    Object.values(FIREBASE_CLIENT_ENV_KEYS).map((key) => [key, z.string().optional()])
  )
);

const clientEnv = clientEnvSchema.parse(process.env);

export const PUBLIC_FIREBASE_CONFIG = {
  apiKey: clientEnv[FIREBASE_CLIENT_ENV_KEYS.apiKey],
  authDomain: clientEnv[FIREBASE_CLIENT_ENV_KEYS.authDomain],
  projectId: clientEnv[FIREBASE_CLIENT_ENV_KEYS.projectId],
  storageBucket: clientEnv[FIREBASE_CLIENT_ENV_KEYS.storageBucket],
  messagingSenderId: clientEnv[FIREBASE_CLIENT_ENV_KEYS.messagingSenderId],
  appId: clientEnv[FIREBASE_CLIENT_ENV_KEYS.appId],
} as const;

/**
 * Returns the list of missing Firebase environment variables (by env var name).
 */
export function getMissingFirebaseEnv(): string[] {
  return Object.entries(FIREBASE_CLIENT_ENV_KEYS)
    .filter(
      ([key]) =>
        !PUBLIC_FIREBASE_CONFIG[key as keyof typeof PUBLIC_FIREBASE_CONFIG]
    )
    .map(([, envName]) => envName);
}

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
