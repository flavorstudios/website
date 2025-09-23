import { NextRequest, NextResponse } from "next/server";

import { logPasswordResetEvent } from "@/lib/admin-password-reset";
import getClientIp from "@/lib/request-ip";

export const dynamic = "force-dynamic";

function shouldTreatAsExpired(errorCode: string | null): boolean {
  if (!errorCode) return false;
  const normalized = errorCode.toLowerCase();
  return normalized.includes("expired") || normalized.includes("invalid");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const requestId = searchParams.get("request") || undefined;
  const error = searchParams.get("error") || searchParams.get("errorCode");
  const ip = getClientIp(req);

  await logPasswordResetEvent("reset_completed", {
    requestId,
    ip,
    status: error ? "error" : "success",
    error: error || undefined,
  });

  const targetPath = shouldTreatAsExpired(error)
    ? "/admin/forgot-password?status=expired"
    : "/admin/login?reset=1";

  const response = NextResponse.redirect(
    new URL(targetPath, req.nextUrl.origin),
    302,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}