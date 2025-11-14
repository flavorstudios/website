import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logError } from "@/lib/log";
import { serverEnv } from "@/env/server";

import { isAdmin } from "@/lib/admin-allowlist";
import { adminCookieOptions } from "@/lib/admin-auth";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";

export function GET(request: NextRequest) {
  const context = createRequestContext(request);
  return jsonResponse(context, {
    mfaRequired: Boolean(serverEnv.ADMIN_TOTP_SECRET),
  });
}

export async function POST(req: NextRequest) {
  const context = createRequestContext(req);
  try {
    const { email, password, otp } = await req.json();
    if (!email || !password) {
      return errorResponse(
        context,
        { error: "Email and password required." },
        400,
      );
    }
    if (!isAdmin(email)) {
      return errorResponse(context, { error: "Email not on admin list" }, 401);
    }
    if (!serverEnv.ADMIN_PASSWORD_HASH || !serverEnv.ADMIN_JWT_SECRET) {
      logError(
        "email-session:config",
        undefined,
        { requestId: context.requestId },
      );
      return errorResponse(context, { error: "Server misconfigured" }, 500);
    }
    const hash = serverEnv.ADMIN_PASSWORD_HASH;
    const secret = serverEnv.ADMIN_JWT_SECRET;
    const passwordMatch = await bcrypt.compare(password, hash);
    if (!passwordMatch) {
      return errorResponse(context, { error: "Authentication failed." }, 401);
    }
    if (serverEnv.ADMIN_TOTP_SECRET) {
      const { totp } = await import("otplib");
      if (!otp || !totp.check(otp, serverEnv.ADMIN_TOTP_SECRET)) {
        return errorResponse(context, { error: "Invalid 2FA code." }, 401);
      }
    }
    const token = jwt.sign({ email }, secret, { expiresIn: "1d" });

    const res = jsonResponse(context, { ok: true });
    res.cookies.set(
      "admin-session",
      token,
      adminCookieOptions({ maxAge: 60 * 60 * 24 }),
    );
    return res;
  } catch (err) {
    logError("email-session", err, { requestId: context.requestId });
    return errorResponse(context, { error: "Authentication failed." }, 401);
  }
}
