import 'server-only';
import { serverEnv, serverEnvMeta } from '../env/server-validation';

if (!serverEnvMeta.allowRelaxedDefaults && serverEnvMeta.missingRequiredEnvVars.length > 0) {
  const missingList = serverEnvMeta.missingRequiredEnvVars.join(', ');
  throw new Error(`Invalid environment configuration\nMissing required env var(s): ${missingList}`);
}

const serviceAccountJson =
  serverEnv.FIREBASE_SERVICE_ACCOUNT_JSON ??
  serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY ??
  null;

let firebaseServiceAccount: Record<string, unknown> | undefined;

if (serviceAccountJson) {
  try {
    firebaseServiceAccount = JSON.parse(serviceAccountJson) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Invalid Firebase service account JSON: ${(error as Error).message ?? 'Unknown parse error'}`,
    );
  }
}

const fallbackBaseUrl = 'http://127.0.0.1:3000';

export const env = Object.freeze({
  baseUrl: serverEnv.BASE_URL ?? fallbackBaseUrl,
  nextPublicBaseUrl:
    serverEnv.NEXT_PUBLIC_BASE_URL ?? serverEnv.BASE_URL ?? fallbackBaseUrl,
  cronSecret: serverEnv.CRON_SECRET ?? '',
  previewSecret: serverEnv.PREVIEW_SECRET ?? '',
  adminJwtSecret: serverEnv.ADMIN_JWT_SECRET ?? '',
  firebaseStorageBucket: serverEnv.FIREBASE_STORAGE_BUCKET ?? '',
  nextPublicFirebaseStorageBucket:
    serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? serverEnv.FIREBASE_STORAGE_BUCKET ?? '',
  firebaseServiceAccountJson: serviceAccountJson ?? undefined,
  firebaseServiceAccount,
});

export { serverEnvMeta };
export type Env = typeof env;