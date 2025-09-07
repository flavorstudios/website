import crypto from "crypto";
import { serverEnv } from "@/env/server";

interface PreviewPayload {
  postId: string;
  uid: string;
  exp: number; // unix timestamp seconds
}

function getSecret(): string {
  const secret = serverEnv.PREVIEW_SECRET;
  if (!secret) {
    throw new Error("Missing PREVIEW_SECRET");
  }
  return secret;
}

export function createPreviewToken(
  postId: string,
  uid: string,
  ttlSeconds = 300
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: PreviewPayload = { postId, uid, exp };
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(base)
    .digest("base64url");
  return `${base}.${sig}`;
}

export function validatePreviewToken(
  token: string,
  postId: string,
  uid: string
): "valid" | "expired" | "invalid" {
  const [base, sig] = token.split(".");
  if (!base || !sig) return "invalid";
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(base)
    .digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return "invalid";
    }
  } catch {
    return "invalid";
  }
  let payload: PreviewPayload;
  try {
    payload = JSON.parse(Buffer.from(base, "base64url").toString());
  } catch {
    return "invalid";
  }
  if (payload.postId !== postId || payload.uid !== uid) return "invalid";
  if (payload.exp < Math.floor(Date.now() / 1000)) return "expired";
  return "valid";
}