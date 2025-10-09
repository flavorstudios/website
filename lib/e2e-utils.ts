import type { NextRequest } from "next/server";

export function isE2EEnabled(): boolean {
  return process.env.E2E === "true" || process.env.NEXT_PUBLIC_E2E === "true";
}

export function hasE2EBypass(request?: NextRequest | null): boolean {
  if (!isE2EEnabled()) {
    return false;
  }
  if (!request) {
    return true;
  }
  const header = request.headers.get("x-e2e-auth");
  if (header && header.toLowerCase() === "bypass") {
    return true;
  }
  const cookie = request.cookies.get("e2e")?.value;
  return cookie === "1" || cookie?.toLowerCase() === "true";
}