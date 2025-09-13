import { config } from "dotenv";
import {
  clientEnvSchema,
  serverEnvSchema,
  serverEnv,
} from "../env/validation";

const skipValidation =
  process.env.ADMIN_BYPASS === "true" ||
  process.env.SKIP_ENV_VALIDATION === "true";

if (skipValidation) {
  console.warn("Skipping Firebase Admin env validation");
}

config({ path: ".env.local" });

if (!skipValidation) {
  clientEnvSchema.parse(process.env);
  serverEnvSchema.parse(process.env);

  if (
    !process.env.FIREBASE_SERVICE_ACCOUNT_KEY &&
    !process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ) {
    throw new Error(
      "Missing required env vars: FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON",
    );
  }

  if (
    !process.env.FIREBASE_STORAGE_BUCKET &&
    !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  ) {
    throw new Error(
      "Missing required env vars: FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    );
  }

  if (!process.env.ADMIN_EMAILS && !process.env.ADMIN_EMAIL) {
    throw new Error("Missing required env vars: ADMIN_EMAILS or ADMIN_EMAIL");
  }
  if (
    process.env.ADMIN_EMAILS !== undefined &&
    process.env.ADMIN_EMAILS.trim() === ""
  ) {
    throw new Error("ADMIN_EMAILS (cannot be empty)");
  }
  if (
    process.env.ADMIN_EMAIL !== undefined &&
    process.env.ADMIN_EMAIL.trim() === ""
  ) {
    throw new Error("ADMIN_EMAIL (cannot be empty)");
  }
  if (
    process.env.CRON_SECRET !== undefined &&
    process.env.CRON_SECRET.trim() === ""
  ) {
    missing.push("CRON_SECRET (cannot be empty)");
  }
}

const json =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ??
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (json) {
  try {
    JSON.parse(json);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY/FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON",
    );
  }
}

const { FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET } =
  serverEnv;

// Only compare buckets when both are present
if (
  !skipValidation &&
  FIREBASE_STORAGE_BUCKET &&
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  FIREBASE_STORAGE_BUCKET !== NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
) {
  throw new Error(
    `FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.\n` +
      `FIREBASE_STORAGE_BUCKET: ${FIREBASE_STORAGE_BUCKET}\n` +
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`,
  );
}
