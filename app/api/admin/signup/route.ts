import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/env/server";
import {
  signupSchema,
  getEmailHash,
  isDisposableEmail,
  requiresEmailVerification,
} from "@/lib/admin-signup";
import {
  incrementSignupEmailAttempts,
  incrementSignupIpAttempts,
  isSignupEmailRateLimited,
  isSignupIpRateLimited,
  resetSignupLimits,
} from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity-log";
import {
  createSessionCookieFromIdToken,
  logAdminAuditFailure,
} from "@/lib/admin-auth";
import { isAdmin, isAdminBypassEnabled } from "@/lib/admin-allowlist";
import { logError } from "@/lib/log";

const createErrorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

function getRequestIp(request: NextRequest): string {
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  return "unknown";
}

async function callIdentityToolkit<T>(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  const apiKey = serverEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  if (!apiKey) {
    throw new Error("Firebase API key is not configured");
  }
  const url = `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Firebase signup failed");
  }
  return data as T;
}

async function createUserWithEmailAndPassword(
  email: string,
  password: string
) {
  const result = await callIdentityToolkit<{
    idToken: string;
    refreshToken: string;
    localId: string;
  }>("accounts:signUp", {
    email,
    password,
    returnSecureToken: true,
  });
  return result;
}

async function updateDisplayName(idToken: string, displayName: string) {
  await callIdentityToolkit("accounts:update", {
    idToken,
    displayName,
    returnSecureToken: false,
  });
}

async function triggerVerificationEmail(idToken: string) {
  await callIdentityToolkit("accounts:sendOobCode", {
    requestType: "VERIFY_EMAIL",
    idToken,
  });
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);

  if (await isSignupIpRateLimited(ip)) {
    await logAdminAuditFailure(null, ip, "signup-rate-limit-ip");
    return createErrorResponse("Too many signup attempts. Try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    logError("admin-signup:invalid-json", err);
    await incrementSignupIpAttempts(ip);
    return createErrorResponse("Invalid request payload.");
  }

  const parseResult = signupSchema.safeParse(body);
  if (!parseResult.success) {
    const flat = parseResult.error.flatten();
    const firstError = flat.fieldErrors.name?.[0]
      || flat.fieldErrors.email?.[0]
      || flat.fieldErrors.password?.[0]
      || "Check the form for errors.";
    const email = typeof (body as { email?: unknown })?.email === "string"
      ? (body as { email: string }).email
      : "";
    if (email) {
      const hash = getEmailHash(email);
      await incrementSignupEmailAttempts(hash);
    }
    await incrementSignupIpAttempts(ip);
    return createErrorResponse(firstError);
  }

  const { email, password, name, marketingOptIn } = parseResult.data;
  const emailHash = getEmailHash(email);

  if (await isSignupEmailRateLimited(emailHash)) {
    await logAdminAuditFailure(email, ip, "signup-rate-limit-email");
    return createErrorResponse("Too many signup attempts for this email.", 429);
  }

  if (isDisposableEmail(email)) {
    await logAdminAuditFailure(email, ip, "disposable-email");
    await incrementSignupEmailAttempts(emailHash);
    await incrementSignupIpAttempts(ip);
    return createErrorResponse("Disposable email domains are not allowed.");
  }

  const bypass = isAdminBypassEnabled();

  const requiresVerification = requiresEmailVerification();

  if (!bypass) {
    if (!isAdmin(email)) {
      await logAdminAuditFailure(email, ip, "email-not-allowlisted");
      await incrementSignupEmailAttempts(emailHash);
      await incrementSignupIpAttempts(ip);
      return createErrorResponse("Email is not allowed for admin access.", 403);
    }
  }

  try {
    let idToken = "";

    if (bypass) {
      idToken = "bypass";
    } else {
      const account = await createUserWithEmailAndPassword(email, password);
      idToken = account.idToken;
      if (name) {
        await updateDisplayName(account.idToken, name);
      }
      if (requiresVerification) {
        await triggerVerificationEmail(account.idToken);
      }
    }

    let sessionCookie = "";
    if (bypass) {
      sessionCookie = "bypass";
    } else {
      const expiryDaysEnv = parseInt(serverEnv.ADMIN_SESSION_EXPIRY_DAYS || "1", 10);
      const expiryDays = Number.isNaN(expiryDaysEnv) || expiryDaysEnv <= 0 ? 1 : expiryDaysEnv;
      sessionCookie = await createSessionCookieFromIdToken(
        idToken,
        60 * 60 * 24 * expiryDays * 1000
      );
    }

    const cookieDomain =
      serverEnv.NODE_ENV === "production"
        ? serverEnv.ADMIN_COOKIE_DOMAIN
        : undefined;

    const cookieOptions = {
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };

    const redirectTo = requiresVerification
      ? "/admin/verify-email"
      : "/admin/dashboard";

    const response = NextResponse.json({
      ok: true,
      requiresVerification,
      redirectTo,
    });

    response.cookies.set("admin-session", sessionCookie, {
      ...cookieOptions,
      maxAge: requiresVerification ? 60 * 60 * 2 : 60 * 60 * 24,
    });

    await resetSignupLimits(ip, emailHash);

    await logActivity({
      type: "auth",
      title: "Admin signup",
      description: `${email} created an admin account${
        marketingOptIn ? " (marketing opt-in)" : ""
      }`,
      user: email,
    });

    return response;
  } catch (err) {
    logError("admin-signup:error", err);
    await incrementSignupEmailAttempts(emailHash);
    await incrementSignupIpAttempts(ip);
    const message =
      err instanceof Error && err.message.includes("EMAIL_EXISTS")
        ? "An account with this email already exists."
        : "Unable to create account.";
    return createErrorResponse(message, 400);
  }
}