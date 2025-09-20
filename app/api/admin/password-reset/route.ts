import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/env/server";
import { isEmailAllowed } from "@/lib/admin-allowlist";
import { adminAuth } from "@/lib/firebase-admin";
import {
  createRequestId,
  getAdditionalAdminEmails,
  logPasswordResetEvent,
  PasswordResetLocation,
  sendPasswordResetEmail,
} from "@/lib/admin-password-reset";
import {
  incrementPasswordResetCounters,
  isPasswordResetEmailRateLimited,
  isPasswordResetIpRateLimited,
} from "@/lib/rate-limit";
import { PASSWORD_RESET_NEUTRAL_MESSAGE, PASSWORD_RESET_RATE_LIMIT_MESSAGE } from "@/lib/password-reset-messages";
import getClientIp from "@/lib/request-ip";
import { logError } from "@/lib/log";

const bodySchema = z.object({
  email: z.string().email(),
});

const MIN_DURATION_MS = 400;

export const dynamic = "force-dynamic";

function resolveBaseUrl(req: NextRequest): string {
  return (
    serverEnv.BASE_URL ||
    serverEnv.NEXT_PUBLIC_BASE_URL ||
    req.nextUrl.origin ||
    "http://127.0.0.1:3000"
  );
}

function parseLocation(headers: Headers): PasswordResetLocation {
  const city = headers.get("x-vercel-ip-city") || headers.get("cf-ipcity");
  const region =
    headers.get("x-vercel-ip-country-region") || headers.get("cf-region") || headers.get("cf-region-code");
  const country = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry");
  return {
    ...(city ? { city: city.trim() } : {}),
    ...(region ? { region: region.trim() } : {}),
    ...(country ? { country: country.trim() } : {}),
  };
}

async function finalizeResponse(start: number, response: NextResponse) {
  response.headers.set("Cache-Control", "no-store");
  const elapsed = Date.now() - start;
  if (elapsed < MIN_DURATION_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DURATION_MS - elapsed));
  }
  return response;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return finalizeResponse(
      start,
      NextResponse.json({ error: "Invalid request payload." }, { status: 400 }),
    );
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return finalizeResponse(
      start,
      NextResponse.json({ error: "Enter a valid email address." }, { status: 400 }),
    );
  }

  const rawEmail = parsed.data.email.trim();
  const normalizedEmail = rawEmail.toLowerCase();

  if (await isPasswordResetIpRateLimited(ip)) {
    return finalizeResponse(
      start,
      NextResponse.json({ error: PASSWORD_RESET_RATE_LIMIT_MESSAGE }, { status: 429 }),
    );
  }

  if (await isPasswordResetEmailRateLimited(normalizedEmail)) {
    return finalizeResponse(
      start,
      NextResponse.json({ error: PASSWORD_RESET_RATE_LIMIT_MESSAGE }, { status: 429 }),
    );
  }

  await incrementPasswordResetCounters(ip, normalizedEmail);

  const requestId = createRequestId();
  const timestamp = new Date().toISOString();
  const baseUrl = resolveBaseUrl(req);
  const userAgent = req.headers.get("user-agent") || undefined;
  const location = parseLocation(req.headers);

  let additionalEmails: string[] = [];
  try {
    additionalEmails = await getAdditionalAdminEmails();
  } catch (error) {
    logError("password-reset:additionalEmails", error);
  }

  const allowed = isEmailAllowed(normalizedEmail, additionalEmails);

  const continueUrl = new URL(
    `/api/admin/password-reset/completed?request=${encodeURIComponent(requestId)}`,
    baseUrl,
  ).toString();

  let firebaseLink: string | null = null;
  if (allowed && adminAuth && serverEnv.TEST_MODE !== "true") {
    try {
      firebaseLink = await adminAuth.generatePasswordResetLink(rawEmail, {
        url: continueUrl,
        handleCodeInApp: false,
      });
    } catch (error) {
      logError("password-reset:generateLink", error, { email: normalizedEmail });
    }
  }

  if (!firebaseLink) {
    firebaseLink = continueUrl;
  }

  const emailLink = new URL(
    `/api/admin/password-reset/open?request=${encodeURIComponent(requestId)}&token=${encodeURIComponent(
      firebaseLink,
    )}`,
    baseUrl,
  ).toString();

  await logPasswordResetEvent("reset_requested", {
    requestId,
    email: allowed ? normalizedEmail : undefined,
    ip,
    userAgent,
    location,
    allowed,
  });

  if (allowed) {
    await sendPasswordResetEmail({
      email: rawEmail,
      emailLink,
      requestId,
      ip,
      userAgent,
      location,
      timestamp,
    });
  }

  const responseBody: Record<string, unknown> = {
    message: PASSWORD_RESET_NEUTRAL_MESSAGE,
  };

  if (serverEnv.TEST_MODE === "true") {
    responseBody.requestId = requestId;
    responseBody.emailLink = emailLink;
  }

  return finalizeResponse(
    start,
    NextResponse.json(responseBody, {
      status: 200,
    }),
  );
}