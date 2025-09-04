import { config } from "dotenv";

config({ path: ".env.local" });

const required = ["ADMIN_JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (!process.env.ADMIN_EMAILS && !process.env.ADMIN_EMAIL) {
  missing.push("ADMIN_EMAILS or ADMIN_EMAIL");
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  missing.push("FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON");
}

if (missing.length > 0) {
  console.error(`Missing required admin env vars: ${missing.join(", ")}`);
  process.exit(1);
}