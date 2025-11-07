import type { Env } from "../src/env";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL?: string;
      NEXT_PUBLIC_BASE_URL?: string;
      CRON_SECRET?: string;
      PREVIEW_SECRET?: string;
      ADMIN_JWT_SECRET?: string;
      FIREBASE_STORAGE_BUCKET?: string;
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
      FIREBASE_SERVICE_ACCOUNT_JSON?: string;
      FIREBASE_SERVICE_ACCOUNT_JSON_B64?: string;
      FIREBASE_SERVICE_ACCOUNT_KEY?: string;
      CORS_ALLOWED_ORIGINS?: string;
    }
  }
}

export type ValidatedEnv = Env;

export {};