import { config, parse } from "dotenv";
import { readFileSync } from "node:fs";

const skipValidation =
  process.env.ADMIN_BYPASS === "true" ||
  process.env.SKIP_ENV_VALIDATION === "true";

if (skipValidation) {
  console.warn("Skipping Firebase Admin env validation");
}

config({ path: ".env.local" });

const serverEnv = {
  FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  CRON_SECRET: process.env.CRON_SECRET,
} as const;

const exampleEnv = parse(readFileSync("env.example", "utf8"));

const firebaseKeys = Object.keys(exampleEnv).filter((key) =>
  key.startsWith("FIREBASE_"),
);

const adminVars = [
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_STORAGE_BUCKET",
];
const required = firebaseKeys.filter((key) => !adminVars.includes(key));
if (!skipValidation) required.push("CRON_SECRET");

const missing = required.filter((key) => !process.env[key]);

if (!skipValidation) {
  // Require at least one service-account source
  if (!adminVars.slice(0, 2).some((key) => process.env[key])) {
    missing.push(
      "FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON",
    );
  }

  if (
    !process.env.FIREBASE_STORAGE_BUCKET &&
    !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  ) {
    missing.push(
      "FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    );
  }

  // Admin email allow-list: require one of ADMIN_EMAILS / ADMIN_EMAIL and disallow empty strings
  if (!process.env.ADMIN_EMAILS && !process.env.ADMIN_EMAIL) {
    missing.push("ADMIN_EMAILS or ADMIN_EMAIL");
  }
  if (
    process.env.ADMIN_EMAILS !== undefined &&
    process.env.ADMIN_EMAILS.trim() === ""
  ) {
    missing.push("ADMIN_EMAILS (cannot be empty)");
  }
  if (
    process.env.ADMIN_EMAIL !== undefined &&
    process.env.ADMIN_EMAIL.trim() === ""
  ) {
    missing.push("ADMIN_EMAIL (cannot be empty)");
  }
  if (
    process.env.CRON_SECRET !== undefined &&
    process.env.CRON_SECRET.trim() === ""
  ) {
    missing.push("CRON_SECRET (cannot be empty)");
  }
}

if (missing.length > 0) {
  throw new Error(`Missing required Firebase env vars: ${missing.join(", ")}`);
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
