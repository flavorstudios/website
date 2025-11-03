import "server-only";
import { z } from "zod";

const trimmedString = z
  .string({ invalid_type_error: "Expected environment variable to be a string" })
  .transform(value => value.trim())
  .pipe(z.string().min(1));

const envSchema = z
  .object({
    BASE_URL: trimmedString,
    NEXT_PUBLIC_BASE_URL: trimmedString,
    CRON_SECRET: trimmedString,
    PREVIEW_SECRET: trimmedString,
    ADMIN_JWT_SECRET: trimmedString,
    FIREBASE_STORAGE_BUCKET: trimmedString,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: trimmedString,
    FIREBASE_SERVICE_ACCOUNT_JSON: trimmedString.optional(),
    FIREBASE_SERVICE_ACCOUNT_JSON_B64: trimmedString.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.FIREBASE_SERVICE_ACCOUNT_JSON && !value.FIREBASE_SERVICE_ACCOUNT_JSON_B64) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_SERVICE_ACCOUNT_JSON"],
        message: "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_JSON_B64",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_SERVICE_ACCOUNT_JSON_B64"],
        message: "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_JSON_B64",
      });
    }
  });

const parsed = envSchema.safeParse({
  BASE_URL: process.env.BASE_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL,
  CRON_SECRET: process.env.CRON_SECRET,
  PREVIEW_SECRET: process.env.PREVIEW_SECRET,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  FIREBASE_SERVICE_ACCOUNT_JSON_B64: process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64,
});

if (!parsed.success) {
  const message = parsed.error.issues
    .map(issue => {
      const path = issue.path.join(".") || "unknown";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
  throw new Error(`Invalid environment configuration\n${message}`);
}

const envValues = parsed.data;

const firebaseServiceAccountJson = envValues.FIREBASE_SERVICE_ACCOUNT_JSON
  ? envValues.FIREBASE_SERVICE_ACCOUNT_JSON
  : envValues.FIREBASE_SERVICE_ACCOUNT_JSON_B64
  ? Buffer.from(envValues.FIREBASE_SERVICE_ACCOUNT_JSON_B64, "base64").toString("utf8")
  : undefined;

let firebaseServiceAccount: Record<string, unknown> | undefined;

if (firebaseServiceAccountJson) {
  try {
    firebaseServiceAccount = JSON.parse(firebaseServiceAccountJson) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Invalid Firebase service account JSON: ${(error as Error).message ?? "Unknown parse error"}`,
    );
  }
}

export const env = Object.freeze({
  baseUrl: envValues.BASE_URL,
  nextPublicBaseUrl: envValues.NEXT_PUBLIC_BASE_URL,
  cronSecret: envValues.CRON_SECRET,
  previewSecret: envValues.PREVIEW_SECRET,
  adminJwtSecret: envValues.ADMIN_JWT_SECRET,
  firebaseStorageBucket: envValues.FIREBASE_STORAGE_BUCKET,
  nextPublicFirebaseStorageBucket: envValues.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  firebaseServiceAccountJson,
  firebaseServiceAccount,
});

export type Env = typeof env;