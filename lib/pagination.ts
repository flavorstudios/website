export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 50;

const hasBuffer = typeof globalThis.Buffer !== "undefined";
const hasBtoa = typeof globalThis.btoa === "function";
const hasAtob = typeof globalThis.atob === "function";

const textEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;

function encodeBase64(input: string): string {
  if (hasBuffer) {
    return Buffer.from(input, "utf8").toString("base64");
  }

  if (hasBtoa && textEncoder) {
    const bytes = textEncoder.encode(input);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  throw new Error("Base64 encoding not supported in this environment");
}

function decodeBase64(input: string): string {
  if (hasBuffer) {
    return Buffer.from(input, "base64").toString("utf8");
  }

  if (hasAtob && textDecoder) {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return textDecoder.decode(bytes);
  }

  throw new Error("Base64 decoding not supported in this environment");
}

function toBase64Url(input: string): string {
  return encodeBase64(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(paddingNeeded);
  return decodeBase64(base64);
}

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
  return toBase64Url(payload);
}

export function decodeIndexCursor(
  cursor: string | null | undefined,
): number | null {
  if (!cursor) return null;
  try {
    const json = fromBase64Url(cursor);
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