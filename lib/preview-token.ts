import crypto from "crypto";
import { serverEnv } from "@/env/server";
import {
  ExpiredPreviewTokenError,
  InvalidPreviewTokenError,
} from "./preview-token-errors";

interface PreviewPayload {
  postId: string;
  uid: string;
  exp: number; // unix timestamp seconds
}

export type PreviewTokenPayload = PreviewPayload;

export interface PreviewTokenExpectations {
  postId?: string;
  uid?: string;
}

function getSecret(): string;
function getSecret(throwOnMissing: true): string;
function getSecret(throwOnMissing: false): string | undefined;
function getSecret(throwOnMissing = true): string | undefined {
  const DEFAULT_PREVIEW_SECRET = "test-secret";
  const envSecret = process.env.PREVIEW_SECRET || serverEnv.PREVIEW_SECRET;
  const nodeEnv = process.env.NODE_ENV || serverEnv.NODE_ENV;
  const testModeEnabled =
    process.env.TEST_MODE === "true" || serverEnv.TEST_MODE === "true";
  const adminAuthDisabled =
    process.env.ADMIN_AUTH_DISABLED === "1" || serverEnv.ADMIN_AUTH_DISABLED === "1";
  const isNonProduction = nodeEnv ? nodeEnv !== "production" : false;
  const shouldUseDefaultSecret = isNonProduction || testModeEnabled || adminAuthDisabled;
  const secret = envSecret || (shouldUseDefaultSecret ? DEFAULT_PREVIEW_SECRET : undefined);
  if (!secret && throwOnMissing) {
    throw new Error("Missing PREVIEW_SECRET");
  }
  return secret;
}

export type PreviewTokenInspection =
  | { status: "invalid" }
  | { status: "expired"; payload: PreviewPayload }
  | { status: "valid"; payload: PreviewPayload };

export function inspectPreviewToken(token: string): PreviewTokenInspection {
  const [base, sig] = token.split(".");
  if (!base || !sig) return { status: "invalid" };
  const secret = getSecret(false);
  if (!secret) {
    return { status: "invalid" };
  }
  const expected = crypto.createHmac("sha256", secret).update(base).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return { status: "invalid" };
    }
  } catch {
    return { status: "invalid" };
  }
  let payload: PreviewPayload;
  try {
    payload = JSON.parse(Buffer.from(base, "base64url").toString());
  } catch {
    return { status: "invalid" };
  }
  if (
    typeof payload?.postId !== "string" ||
    typeof payload?.uid !== "string" ||
    typeof payload?.exp !== "number"
  ) {
    return { status: "invalid" };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { status: "expired", payload };
  }
  return { status: "valid", payload };
}

export function validatePreviewTokenOrThrow(
  token: string | null | undefined,
  expectations: PreviewTokenExpectations = {}
): PreviewTokenPayload {
  if (!token) {
    throw new InvalidPreviewTokenError();
  }

  const inspection = inspectPreviewToken(token);

  if (inspection.status === "invalid") {
    throw new InvalidPreviewTokenError();
  }

  if (inspection.status === "expired") {
    throw new ExpiredPreviewTokenError();
  }

  const { postId, uid } = expectations;
  const { payload } = inspection;

  if (postId && payload.postId !== postId) {
    throw new InvalidPreviewTokenError();
  }

  if (uid && payload.uid !== uid) {
    throw new InvalidPreviewTokenError();
  }

  return payload;
}

export function createPreviewToken(
  postId: string,
  uid: string,
  ttlSeconds = 300
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: PreviewPayload = { postId, uid, exp };
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = getSecret();
  const sig = crypto
    .createHmac("sha256", secret)
    .update(base)
    .digest("base64url");
  return `${base}.${sig}`;
}

export function validatePreviewToken(
  token: string,
  postId: string,
  uid: string
): "valid" | "expired" | "invalid" {
  const inspection = inspectPreviewToken(token);
  if (inspection.status !== "valid") {
    return inspection.status;
  }
  const { payload } = inspection;
  if (payload.postId !== postId || payload.uid !== uid) return "invalid";
  return "valid";
}