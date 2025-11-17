import type { NextRequest } from "next/server";
import { serverEnv } from "@/env/server";
import { isAdminSdkAvailable } from "@/lib/firebase-admin";
import { hasE2EBypass, isE2EEnabled } from "@/lib/e2e-utils";

const truthy = (value: string | undefined | null): boolean =>
  value === "true" || value === "1";

export function shouldUseAdminBlogFixtures(request?: NextRequest): boolean {
  if (truthy(serverEnv.ADMIN_BYPASS) || truthy(process.env.ADMIN_BYPASS)) {
    return true;
  }

  if (truthy(serverEnv.USE_DEMO_CONTENT) || truthy(process.env.USE_DEMO_CONTENT)) {
    return true;
  }

  if (isE2EEnabled() && hasE2EBypass(request)) {
    return true;
  }

  if (!isAdminSdkAvailable()) {
    return true;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    truthy(process.env.SKIP_STRICT_ENV)
  ) {
    return true;
  }

  return false;
}