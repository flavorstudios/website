import { NextRequest, NextResponse } from "next/server";

import { logPasswordResetEvent } from "@/lib/admin-password-reset";
import getClientIp from "@/lib/request-ip";

export const dynamic = "force-dynamic";

function isAllowedRedirect(target: URL, origin: URL): boolean {
  if (target.origin === origin.origin) {
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

  if (!isAllowedRedirect(redirectUrl, new URL(origin))) {
    return new NextResponse("Redirect not allowed", { status: 400 });
  }

  await logPasswordResetEvent("reset_link_opened", {
    requestId,
    ip: getClientIp(req),
    target: redirectUrl.toString(),
  });

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}