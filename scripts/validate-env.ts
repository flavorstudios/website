import { config } from "dotenv";

config({ path: ".env.local" });

const missing = FIREBASE_REQUIRED_ENV_VARS.filter(k => !process.env[k]);
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