import "server-only";

import { createHash } from "crypto";

import { serverEnv } from "@/env/server";
import {
  signupFormSchema,
  type SignupFormInput,
  PASSWORD_HINTS,
  getPasswordHints,
} from "./admin-signup-shared";

export const signupSchema = signupFormSchema;

export type SignupInput = SignupFormInput;

export { PASSWORD_HINTS, getPasswordHints };

export function getEmailHash(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function isDisposableEmail(email: string): boolean {
  const raw = serverEnv.ADMIN_DISPOSABLE_DOMAINS;
  if (!raw) return false;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return false;
  return raw
    .split(",")
    .map((entry: string) => entry.trim().toLowerCase())
    .filter((entry: string) => entry.length > 0)
    .some(
      (blocked: string) => domain === blocked || domain.endsWith(`.${blocked}`),
    );
}

export function requiresEmailVerification(): boolean {
  const serverRequires = serverEnv.ADMIN_REQUIRE_EMAIL_VERIFICATION === "true"
  const e2eActive = process.env.E2E === "true" || process.env.E2E === "1"

  if (e2eActive) {
    return (
      serverRequires ||
      process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true"
    )
  }

  return serverRequires
}