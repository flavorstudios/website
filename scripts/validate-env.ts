import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { applyDefaultEnv } from "../env/defaults";

const maybeLoadEnvFile = (file: string | undefined): void => {
  if (!file) return;
  const fullPath = resolve(process.cwd(), file);
  if (existsSync(fullPath)) {
    config({ path: fullPath });
  }
};

const preferProductionEnv =
  process.env.NODE_ENV === "production" || process.env.CI === "true" ||
  process.env.CI === "1";

maybeLoadEnvFile(preferProductionEnv ? ".env.production" : undefined);
maybeLoadEnvFile(".env");
maybeLoadEnvFile(".env.local");

const appliedDefaultKeys = applyDefaultEnv();

const truthyFlags = new Set(["1", "true", "TRUE", "True"]);
const allowDefaultsExplicitly = truthyFlags.has(process.env.USE_DEFAULT_ENV ?? "");

const { clientEnvSchema } = await import("../env/client-validation");
const { serverEnvSchema, serverEnv } = await import("../env/server-validation");

const skipValidation =
  process.env.ADMIN_BYPASS === "true" ||
  process.env.SKIP_ENV_VALIDATION === "true";

if (appliedDefaultKeys.length > 0) {
  if (process.env.NODE_ENV !== "test" && !allowDefaultsExplicitly) {
    throw new Error(
      `[env] Default fallback values are disabled. Missing required env vars: ${appliedDefaultKeys.join(", ")}`,
    );
  }
  
  console.warn(
    `[env] Using fallback values for missing env vars: ${appliedDefaultKeys.join(", ")}`,
  );
}

if (skipValidation) {
  console.warn("Skipping Firebase Admin env validation");
}

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
    throw new Error("CRON_SECRET (cannot be empty)");
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
