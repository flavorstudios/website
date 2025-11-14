import { Buffer } from "node:buffer";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 50;

export function clampPageSize(
  limit: number | null | undefined,
  fallback = DEFAULT_PAGE_SIZE,
) {
  if (typeof limit !== "number" || Number.isNaN(limit)) {
    return fallback;
  }
  if (limit < 1) return 1;
  if (limit > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return Math.floor(limit);
}

export function encodeIndexCursor(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Cursor index must be a non-negative integer");
  }
  const payload = JSON.stringify({ i: index });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeIndexCursor(
  cursor: string | null | undefined,
): number | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { i?: unknown };
    if (
      typeof parsed.i === "number" &&
      Number.isInteger(parsed.i) &&
      parsed.i >= 0
    ) {
      return parsed.i;
    }
    return null;
  } catch {
    return null;
  }
}