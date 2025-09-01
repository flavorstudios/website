import { config, parse } from "dotenv";
import { readFileSync } from "fs";

config({ path: ".env.local" });

const exampleEnv = parse(readFileSync("env.example", "utf8"));
const required = Object.keys(exampleEnv).filter(key => key.startsWith("FIREBASE_"));

const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error("Missing required Firebase env vars:", missing.join(", "));
  process.exit(1);
}

if (
  process.env.FIREBASE_STORAGE_BUCKET !== process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
) {
  console.error(
    "FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.",
    `FIREBASE_STORAGE_BUCKET: ${process.env.FIREBASE_STORAGE_BUCKET}`,
    `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`
  );
  process.exit(1);
}
