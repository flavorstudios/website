import { config, parse } from "dotenv";
import { readFileSync } from "node:fs";
import { serverEnv } from "../env/server.js";

config({ path: ".env.local" });

const exampleEnv = parse(readFileSync("env.example", "utf8"));
const required = Object.keys(exampleEnv).filter((key) => key.startsWith("FIREBASE_"));

const missing = required.filter(key => !serverEnv[key]);
if (missing.length > 0) {
  console.error("Missing required Firebase env vars:", missing.join(", "));
  process.exit(1);
}

const { FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET } = process.env;

if (FIREBASE_STORAGE_BUCKET !== NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  console.error(
    "FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.",
    `FIREBASE_STORAGE_BUCKET: ${serverEnv.FIREBASE_STORAGE_BUCKET}`,
    `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`
  );
  process.exit(1);
}
