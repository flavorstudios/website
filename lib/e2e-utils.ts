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
  if (cookie === "1" || cookie?.toLowerCase() === "true") {
    return true;
  }

  // When E2E mode is enabled we always bypass, even if the header/cookie
  // is missing (for example from client-side fetch calls triggered by
  // Playwright). This keeps all fixtures and mocked data paths active in
  // CI without requiring each request to manually forward the header.
  return true;
}