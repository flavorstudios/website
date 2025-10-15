import type { NextRequest } from "next/server";

function isTruthyFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

export function isE2EEnabled(): boolean {
  return isTruthyFlag(process.env.E2E) || isTruthyFlag(process.env.NEXT_PUBLIC_E2E);
}

export function isClientE2EEnabled(): boolean {
  if (typeof window === "undefined") {
    return isE2EEnabled();
  }

  if (isE2EEnabled()) {
    return true;
  }

  const nextData = (window as unknown as Record<string, any>).__NEXT_DATA__;
  const nextRuntimeFlag = nextData?.runtimeConfig?.E2E;
  const nextQueryFlag = nextData?.query?.E2E ?? nextData?.query?.e2e;

  const globalFlag = Boolean((window as unknown as Record<string, unknown>).__E2E__);
  const nextConfigFlag = isTruthyFlag(
    typeof nextRuntimeFlag === "string" ? nextRuntimeFlag : undefined
  );
  const nextQueryTruthy = isTruthyFlag(
    typeof nextQueryFlag === "string" ? nextQueryFlag : undefined
  );

  let storageFlag = false;
  try {
    const { localStorage, sessionStorage } = window;
    storageFlag =
      localStorage?.getItem("admin-e2e-enabled") === "true" ||
      sessionStorage?.getItem("admin-e2e-enabled") === "true" ||
      localStorage?.getItem("admin-test-email-verified") !== null;
  } catch {
    storageFlag = false;
  }

  const searchFlag =
    typeof window.location?.search === "string" &&
    /(?:^|[?&])e2e=(?:1|true)/i.test(window.location.search);

  const webdriverFlag =
    typeof navigator !== "undefined" && Boolean((navigator as any).webdriver);

  return (
    globalFlag ||
    nextConfigFlag ||
    nextQueryTruthy ||
    storageFlag ||
    searchFlag ||
    webdriverFlag
  );
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