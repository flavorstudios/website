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
  process.env.NODE_ENV === "production" ||
  process.env.CI === "true" ||
  process.env.CI === "1";

maybeLoadEnvFile(preferProductionEnv ? ".env.production" : undefined);
maybeLoadEnvFile(".env");
maybeLoadEnvFile(".env.local");

const appliedDefaultKeys = applyDefaultEnv();

const truthyFlags = new Set(["1", "true", "TRUE", "True"]);
const allowDefaultsExplicitly = truthyFlags.has(process.env.USE_DEFAULT_ENV ?? "");

const relaxedValidation =
  process.env.NODE_ENV === "test" ||
  truthyFlags.has(process.env.ALLOW_INSECURE_ENV ?? "");

const { clientEnvSchema } = await import("../env/client-validation");
const { serverEnvSchema, serverEnv, serverEnvMeta } = await import(
  "../env/server-validation",
);
const skipValidation = relaxedValidation;

if (appliedDefaultKeys.length > 0) {
  if (!relaxedValidation && !allowDefaultsExplicitly) {
    throw new Error(
      `[env] Default fallback values are disabled. Missing required env vars: ${appliedDefaultKeys.join(", ")}`,
    );
  }

  console.warn(
    `[env] Using fallback values for missing env vars: ${appliedDefaultKeys.join(", ")}`,
  );
}

if (skipValidation) {
  console.warn("Skipping strict Firebase/Admin env validation (test or relaxed mode).");
}

const serverMissingRequired = serverEnvMeta.missingRequiredEnvVars;
const serverMissingOptional = serverEnvMeta.missingOptionalEnvVars;

if (!skipValidation) {
  clientEnvSchema.parse(process.env);
  serverEnvSchema.parse(process.env);

  if (serverMissingRequired.length > 0) {
    throw new Error(
      `[env] Missing required server env var(s): ${serverMissingRequired.join(", ")}`,
    );
  }

  if (serverEnvMeta.bucketMismatch) {
    throw new Error(
      `FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.\n` +
        `FIREBASE_STORAGE_BUCKET: ${serverEnv.FIREBASE_STORAGE_BUCKET ?? 'undefined'}\n` +
        `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'undefined'}`,
    );
  }

  if (!serverEnvMeta.hasServiceAccount) {
    throw new Error(
      "Missing required env vars: FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_KEY",
    );
  }
} else {
  if (serverMissingRequired.length > 0) {
    console.warn(
      `[env] Missing (relaxed) required server env var(s): ${serverMissingRequired.join(", ")}`,
    );
  }

  if (serverMissingOptional.length > 0) {
    console.warn(
      `[env] Missing optional server env var(s): ${serverMissingOptional.join(", ")}`,
    );
  }
}

const json = serverEnv.FIREBASE_SERVICE_ACCOUNT_JSON ?? serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY;

if (json) {
  try {
    JSON.parse(json);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY/FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON",
    );
  }
}

if (serverEnvMeta.appliedFallbackKeys.length > 0) {
  console.warn(
    `[env] Using generated fallback values for: ${serverEnvMeta.appliedFallbackKeys.join(", ")}`,
  );
}
