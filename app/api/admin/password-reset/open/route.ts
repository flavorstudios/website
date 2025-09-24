import { NextRequest, NextResponse } from "next/server";

import { logPasswordResetEvent } from "@/lib/admin-password-reset";
import getClientIp from "@/lib/request-ip";

export const dynamic = "force-dynamic";

function isAllowedRedirect(target: URL, origin: URL): boolean {
  if (target.origin === origin.origin) {
    return true;
  }

  const isCi = process.env.CI && process.env.CI !== "false";
  if (isCi && target.protocol === "http:" && target.host === origin.host) {
    return true;
  }

  if (target.protocol !== "https:") {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");
  const requestId = searchParams.get("request") || undefined;

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(token);
  } catch {
    return new NextResponse("Invalid token", { status: 400 });
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(decoded);
  } catch {
    return new NextResponse("Invalid redirect", { status: 400 });
  }

  const originUrl = new URL(origin);

  if (!isAllowedRedirect(redirectUrl, originUrl)) {
    return new NextResponse("Redirect not allowed", { status: 400 });
  }

  const loginUrl = new URL("/admin/login?reset=1", originUrl);
  const isCompletedUrl =
    redirectUrl.origin === originUrl.origin &&
    redirectUrl.pathname === "/api/admin/password-reset/completed";

  await logPasswordResetEvent("reset_link_opened", {
    requestId,
    ip: getClientIp(req),
    target: redirectUrl.toString(),
  });

  if (isCompletedUrl) {
    const response = NextResponse.redirect(loginUrl, 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const response = NextResponse.redirect(redirectUrl, 302);
  response.headers.set("Cache-Control", "no-store");
  return response;
}