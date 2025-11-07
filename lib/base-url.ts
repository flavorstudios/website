import type { NextRequest } from "next/server";
import { serverEnv } from "@/env/server";

const DEV_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];

const normalize = (value: string): string => {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return value.replace(/\/$/, "");
  }
};

const splitList = (value: string | undefined): string[] =>
  value
    ? value
        .split(/[,\s]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

const gatherConfiguredOrigins = (): string[] => {
  const { CORS_ALLOWED_ORIGINS } = serverEnv as Record<string, string | undefined>;
  const canonical = [serverEnv.BASE_URL, serverEnv.NEXT_PUBLIC_BASE_URL]
    .filter(Boolean)
    .map((origin) => normalize(origin as string));

  const extra = splitList(CORS_ALLOWED_ORIGINS);
  return [...canonical, ...extra];
};

export const canonicalBaseUrl = (): string => {
  const { BASE_URL, NEXT_PUBLIC_BASE_URL } = serverEnv;
  if (BASE_URL) return normalize(BASE_URL);
  if (NEXT_PUBLIC_BASE_URL) return normalize(NEXT_PUBLIC_BASE_URL);
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const resolveRequestBaseUrl = (
  request?: NextRequest | Request,
): string => {
  if (request) {
    const headers = request.headers;
    const forwardedProto = headers.get("x-forwarded-proto");
    const forwardedHost =
      headers.get("x-forwarded-host") ?? headers.get("host") ?? undefined;
    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }
    try {
      const url = new URL(request.url);
      return `${url.protocol}//${url.host}`;
    } catch {
      // ignore parsing errors and fall back to canonical base url
    }
  }

  return canonicalBaseUrl();
};

export const allowedOrigins = (): Set<string> => {
  const origins = new Set<string>();
  for (const origin of [...gatherConfiguredOrigins(), ...DEV_ORIGINS]) {
    if (!origin) continue;
    origins.add(normalize(origin));
  }
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
  if (vercelUrl) {
    origins.add(normalize(vercelUrl));
  }
  return origins;
};

export const normalizeOrigin = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return value.replace(/\/$/, "");
  }
};