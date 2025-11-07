import "server-only";

const TRUTHY = new Set(["1", "true", "yes"]);

const isTruthy = (value: string | undefined) =>
  value ? TRUTHY.has(value.trim().toLowerCase()) : false;

const isTestEnv = process.env.NODE_ENV === "test";
const isRelaxed = isTruthy(process.env.SKIP_STRICT_ENV) || isTestEnv;

const PLACEHOLDERS = {
  BASE_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_BASE_URL: "http://127.0.0.1:3000",
  CRON_SECRET: "cron-placeholder",
  PREVIEW_SECRET: "preview-placeholder",
  ADMIN_JWT_SECRET: "admin-jwt-placeholder",
  FIREBASE_STORAGE_BUCKET: "placeholder.appspot.com",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "placeholder.appspot.com",
} as const;

type PlaceholderKey = keyof typeof PLACEHOLDERS;

function normalize(value: string | undefined) {
  return value?.trim() ?? "";
}

function placeholderFor(name: string, key?: PlaceholderKey): string {
  if (key) return PLACEHOLDERS[key];
  if (Object.hasOwn(PLACEHOLDERS, name)) {
    return PLACEHOLDERS[name as PlaceholderKey];
  }
  return "placeholder";
}

function readEnv(
  name: string,
  options: { required?: boolean; fallback?: string; placeholderKey?: PlaceholderKey } = {},
): string | undefined {
  const raw = normalize(process.env[name]);
  if (raw) {
    return raw;
  }

  const { required = true, fallback, placeholderKey } = options;

  if (!required) {
    return fallback;
  }

  if (!isRelaxed) {
    throw new Error(`Missing environment variable ${name}`);
  }

  if (fallback) {
    return fallback;
  }

  return placeholderFor(name, placeholderKey);
}

function optionalEnv(name: string) {
  const raw = normalize(process.env[name]);
  return raw.length > 0 ? raw : undefined;
}

const baseUrl = readEnv("BASE_URL", { placeholderKey: "BASE_URL" });
const nextPublicBaseUrl =
  optionalEnv("NEXT_PUBLIC_BASE_URL") ||
  baseUrl ||
  (isRelaxed ? PLACEHOLDERS.NEXT_PUBLIC_BASE_URL : undefined);

const cronSecret = readEnv("CRON_SECRET", { placeholderKey: "CRON_SECRET" });
const previewSecret = readEnv("PREVIEW_SECRET", { placeholderKey: "PREVIEW_SECRET" });
const adminJwtSecret = readEnv("ADMIN_JWT_SECRET", { placeholderKey: "ADMIN_JWT_SECRET" });

const rawStorageBucket = optionalEnv("FIREBASE_STORAGE_BUCKET");
const rawPublicStorageBucket = optionalEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");

if (
  rawStorageBucket &&
  rawPublicStorageBucket &&
  rawStorageBucket !== rawPublicStorageBucket &&
  !isRelaxed
) {
  throw new Error(
    "FIREBASE_STORAGE_BUCKET and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET must match",
  );
}

let firebaseStorageBucket = rawStorageBucket || rawPublicStorageBucket;
let nextPublicFirebaseStorageBucket = rawPublicStorageBucket || rawStorageBucket;

if (!firebaseStorageBucket) {
  if (isRelaxed) {
    firebaseStorageBucket = PLACEHOLDERS.FIREBASE_STORAGE_BUCKET;
  } else {
    throw new Error("Missing environment variable FIREBASE_STORAGE_BUCKET");
  }
}

if (!nextPublicFirebaseStorageBucket) {
  nextPublicFirebaseStorageBucket = isRelaxed
    ? PLACEHOLDERS.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    : firebaseStorageBucket;
}

const firebaseServiceAccountJson = optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON");
const firebaseServiceAccountKey = optionalEnv("FIREBASE_SERVICE_ACCOUNT_KEY");
const firebaseServiceAccountJsonB64 = optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON_B64");

let resolvedServiceAccountJson = firebaseServiceAccountJson || firebaseServiceAccountKey;

if (!resolvedServiceAccountJson && firebaseServiceAccountJsonB64) {
  try {
    resolvedServiceAccountJson = Buffer.from(
      firebaseServiceAccountJsonB64,
      "base64",
    ).toString("utf8");
  } catch (error) {
    if (!isRelaxed) {
      throw new Error(
        `Invalid Firebase service account base64 encoding: ${
          (error as Error).message ?? "Unknown decode error"
        }`,
      );
    }
    resolvedServiceAccountJson = undefined;
  }
}

if (!resolvedServiceAccountJson && !isRelaxed) {
  throw new Error(
    "Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_JSON_B64, or FIREBASE_SERVICE_ACCOUNT_KEY",
  );
}

let firebaseServiceAccount: Record<string, unknown> | undefined;

if (resolvedServiceAccountJson) {
  try {
    firebaseServiceAccount = JSON.parse(
      resolvedServiceAccountJson,
    ) as Record<string, unknown>;
  } catch (error) {
    if (!isRelaxed) {
      throw new Error(
        `Invalid Firebase service account JSON: ${
          (error as Error).message ?? "Unknown parse error"
        }`,
      );
    }
    resolvedServiceAccountJson = undefined;
    firebaseServiceAccount = undefined;
  }
}

export const env = Object.freeze({
  baseUrl,
  nextPublicBaseUrl,
  cronSecret,
  previewSecret,
  adminJwtSecret,
  firebaseStorageBucket,
  nextPublicFirebaseStorageBucket,
  firebaseServiceAccountJson: resolvedServiceAccountJson,
  firebaseServiceAccount,
});

export type Env = typeof env;