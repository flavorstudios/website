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
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
} as const;

const exampleEnv = parse(readFileSync("env.example", "utf8"));

const firebaseKeys = Object.keys(exampleEnv).filter((key) =>
  key.startsWith("FIREBASE_")
);

const adminVars = [
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_STORAGE_BUCKET",
];
const required = firebaseKeys.filter((key) => !adminVars.includes(key));

const missing = required.filter((key) => !process.env[key]);
if (!skipValidation) {
  if (!adminVars.slice(0, 2).some((key) => process.env[key])) {
    missing.push("FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  if (
    !process.env.FIREBASE_STORAGE_BUCKET &&
    !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  ) {
    missing.push("FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  }
}

if (missing.length > 0) {
  throw new Error(`Missing required Firebase env vars: ${missing.join(", ")}`);
}

if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  );
}

const { FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET } = serverEnv;

if (
  !skipValidation &&
  FIREBASE_STORAGE_BUCKET &&
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  FIREBASE_STORAGE_BUCKET !== NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
) {
  throw new Error(
    `FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.\n` +
      `FIREBASE_STORAGE_BUCKET: ${FIREBASE_STORAGE_BUCKET}\n` +
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`
  );
}
