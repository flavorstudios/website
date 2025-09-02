import "server-only";

/**
 * Server-only Firebase environment variables.
 * Values are read directly from `process.env` to ensure they are
 * excluded from client bundles.
 */
export const serverEnv = {
  FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
} as const;

export type ServerEnv = typeof serverEnv;