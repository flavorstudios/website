#!/usr/bin/env tsx
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import {
  SUPPORTED_ROLES,
  type SupportedRole,
  grantRole,
  revokeRole,
  listAdmins as listAdminsModule,
} from "@/lib/admin-claims-service";

const VALID_ROLES = new Set(SUPPORTED_ROLES);

type Command = "grant" | "revoke" | "list" | "help";

type Args = {
  command: Command;
  email?: string;
  role?: SupportedRole;
};

function loadEnvFile(file: string | undefined) {
  if (!file) return;
  const fullPath = resolve(process.cwd(), file);
  if (existsSync(fullPath)) {
    config({ path: fullPath });
  }
}

function loadEnv(): void {
  const preferProd = process.env.NODE_ENV === "production";
  loadEnvFile(preferProd ? ".env.production" : undefined);
  loadEnvFile(".env");
  loadEnvFile(".env.local");
  loadEnvFile(".env.admin");
}

function parseArgs(): Args {
  const [, , rawCommand, emailArg, roleArg] = process.argv;
  if (!rawCommand) {
    return { command: "help" };
  }
  const command = rawCommand.toLowerCase() as Command;
  if (!["grant", "revoke", "list", "help"].includes(command)) {
    return { command: "help" };
  }
  const normalizedEmail = emailArg?.trim().toLowerCase();
  const normalizedRole = roleArg?.trim().toLowerCase();
  const role =
    normalizedRole && VALID_ROLES.has(normalizedRole as SupportedRole)
      ? (normalizedRole as SupportedRole)
      : ("admin" as SupportedRole);
  return { command, email: normalizedEmail, role };
}

function requireEmail(email: string | undefined): string {
  if (!email) {
    console.error("Email address is required (e.g. grant user@example.com)");
    process.exit(1);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`Invalid email address: ${email}`);
    process.exit(1);
  }
  return email;
}

async function ensureFirebaseInitialized(): Promise<void> {
  if (getApps().length > 0) return;
  const rawCredentials =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64;
  if (!rawCredentials) {
    console.error(
      "Missing FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON environment variables."
    );
    process.exit(1);
  }

  let credentialsJson = rawCredentials;
  if (!rawCredentials.trim().startsWith("{")) {
    credentialsJson = Buffer.from(rawCredentials, "base64").toString("utf8");
  }

  try {
    const parsed = JSON.parse(credentialsJson);
    initializeApp({
      credential: cert(parsed),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error("Failed to parse Firebase service account JSON", error);
    process.exit(1);
  }
}

async function grantAdmin(email: string, role: SupportedRole) {
  await ensureFirebaseInitialized();
  const auth = getAuth();
  const db = getFirestore();

  try {
    await grantRole({ auth, firestore: db }, email, role);
  } catch (error) {
    console.error(`Failed to grant ${role} to ${email}`, error);
    process.exit(1);
  }

  console.log(`Granted ${role} role to ${email}`);
}

async function revokeAdmin(email: string) {
  await ensureFirebaseInitialized();
  const auth = getAuth();
  const db = getFirestore();

  try {
    await revokeRole({ auth, firestore: db }, email);
  } catch (error) {
    console.error(`Failed to revoke admin access for ${email}`, error);
    process.exit(1);
  }

  console.log(`Revoked admin access for ${email}`);
}

async function listAdmins() {
  await ensureFirebaseInitialized();
  const auth = getAuth();
  const db = getFirestore();

  try {
    const { directory, claimAdmins } = await listAdminsModule({
      auth,
      firestore: db,
    });

    console.log("Admin directory (Firestore)");
    console.table(directory);

    console.log("\nFirebase users with admin claim");
    console.table(
      claimAdmins.filter((entry) => {
        if (entry.role === "admin") return true;
        if (!entry.roles || typeof entry.roles !== "object") return false;
        return Boolean((entry.roles as Record<string, unknown>).admin);
      })
    );
  } catch (error) {
    console.error("Failed to list admin users", error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`Usage: pnpm exec tsx scripts/admin-claims.ts <command> [email] [role]\n\nCommands:\n  grant <email> [role]   Set custom claims, admin_users, and roles doc (role defaults to admin)\n  revoke <email>         Remove admin claims and admin_users entry\n  list                   Show current admin claims and Firestore records\n  help                   Display this message\n\nExamples:\n  pnpm exec tsx scripts/admin-claims.ts grant admin@example.com admin\n  pnpm exec tsx scripts/admin-claims.ts grant editor@example.com editor\n  pnpm exec tsx scripts/admin-claims.ts revoke admin@example.com\n  pnpm exec tsx scripts/admin-claims.ts list\n`);
}

async function main() {
  loadEnv();
  const { command, email, role } = parseArgs();

  switch (command) {
    case "grant": {
      const normalizedEmail = requireEmail(email);
      await grantAdmin(normalizedEmail, role ?? ("admin" as SupportedRole));
      break;
    }
    case "revoke": {
      const normalizedEmail = requireEmail(email);
      await revokeAdmin(normalizedEmail);
      break;
    }
    case "list": {
      await listAdmins();
      break;
    }
    default:
      printHelp();
      break;
  }
}

main().catch((error) => {
  console.error("Admin claim command failed", error);
  process.exit(1);
});