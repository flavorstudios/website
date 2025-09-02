import { config, parse } from "dotenv";
import { readFileSync } from "node:fs";

config({ path: ".env.local" });

const exampleEnv = parse(readFileSync("env.example", "utf8"));
const required = Object.keys(exampleEnv).filter((key) => key.startsWith("FIREBASE_"));

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required Firebase env vars: ${missing.join(", ")}`);
}

if (serverEnv.FIREBASE_STORAGE_BUCKET !== process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  );
}

if (FIREBASE_STORAGE_BUCKET !== NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  throw new Error(
    `FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.\n` +
      `FIREBASE_STORAGE_BUCKET: ${FIREBASE_STORAGE_BUCKET}\n` +
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`
  );
}
