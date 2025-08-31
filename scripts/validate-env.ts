const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_STORAGE_BUCKET",
] as const;

const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error("Missing required Firebase env vars:", missing.join(", "));
  process.exit(1);
}

if (
  process.env.FIREBASE_STORAGE_BUCKET !== process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
) {
  console.error(
    "FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET."
  );
  process.exit(1);
}