import "server-only";

const TRUTHY = new Set(["1", "true", "yes"]);

const isTruthy = (value: string | undefined) =>
  value ? TRUTHY.has(value.trim().toLowerCase()) : false;

const isRelaxed =
  isTruthy(process.env.SKIP_STRICT_ENV) ||
  isTruthy(process.env.SKIP_ENV_VALIDATION) ||
  process.env.NODE_ENV === "test";

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

function readEnv<K extends PlaceholderKey>(name: K): string;
function readEnv(name: string, options: { required?: boolean; fallback?: string }): string | undefined;
function readEnv(
  name: string,
  options: { required?: boolean; fallback?: string } = { required: true },
): string | undefined {
  const raw = normalize(process.env[name]);
  if (raw) {
    return raw;
  }

  const { required = true, fallback } = options;

  if (!required) {
    if (fallback) {
      return fallback;
    }
  return undefined;
  }

if (fallback) {
    return fallback;
  }

  if (name in PLACEHOLDERS && isRelaxed) {
    return PLACEHOLDERS[name as PlaceholderKey];
  }

  if (isRelaxed) {
    return "placeholder";
  }

  throw new Error(`Missing environment variable ${name}`);
}

function optionalEnv(name: string) {
  const raw = normalize(process.env[name]);
  return raw.length > 0 ? raw : undefined;
}

const baseUrl = readEnv("BASE_URL");
const nextPublicBaseUrl =
  optionalEnv("NEXT_PUBLIC_BASE_URL") || baseUrl || PLACEHOLDERS.NEXT_PUBLIC_BASE_URL;
const cronSecret = readEnv("CRON_SECRET");
const previewSecret = readEnv("PREVIEW_SECRET");
const adminJwtSecret = readEnv("ADMIN_JWT_SECRET");

const firebaseStorageBucket =
  optionalEnv("FIREBASE_STORAGE_BUCKET") ||
  optionalEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
  (isRelaxed ? PLACEHOLDERS.FIREBASE_STORAGE_BUCKET : undefined);

if (!firebaseStorageBucket) {
  throw new Error("Missing environment variable FIREBASE_STORAGE_BUCKET");
}

const nextPublicFirebaseStorageBucket =
  optionalEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
  firebaseStorageBucket ||
  PLACEHOLDERS.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const firebaseServiceAccountJson = optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON");
const firebaseServiceAccountJsonB64 = optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON_B64");

let resolvedServiceAccountJson = firebaseServiceAccountJson;

if (!resolvedServiceAccountJson && firebaseServiceAccountJsonB64) {
  try {
    resolvedServiceAccountJson = Buffer.from(
      firebaseServiceAccountJsonB64,
      "base64",
    ).toString("utf8");
  } catch (error) {
    throw new Error(
      `Invalid Firebase service account base64 encoding: ${
        (error as Error).message ?? "Unknown decode error"
      }`,
    );
  }
}

if (!resolvedServiceAccountJson && !isRelaxed) {
  throw new Error("Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_JSON_B64");
}

let firebaseServiceAccount: Record<string, unknown> | undefined;

if (resolvedServiceAccountJson) {
  try {
    firebaseServiceAccount = JSON.parse(resolvedServiceAccountJson) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Invalid Firebase service account JSON: ${
        (error as Error).message ?? "Unknown parse error"
      }`,
    );
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