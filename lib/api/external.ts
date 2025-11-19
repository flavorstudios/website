import { canonicalBaseUrl } from "@/lib/base-url";

function normalizeBaseUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, "");
}

export function getExternalApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ?? canonicalBaseUrl();
}

export function buildExternalApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getExternalApiBaseUrl();
  try {
    return new URL(normalizedPath, base).toString();
  } catch {
    return `${base}${normalizedPath}`;
  }
}