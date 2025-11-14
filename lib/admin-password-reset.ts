import "server-only";

import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { serverEnv } from "@/env/server";
import { isTestMode } from "@/config/flags";
import { adminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

export type PasswordResetAuditEvent =
  | "reset_requested"
  | "reset_link_opened"
  | "reset_completed";

export type PasswordResetLocation = {
  city?: string;
  region?: string;
  country?: string;
};

export async function getAdditionalAdminEmails(): Promise<string[]> {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection("admin_users").get();
    return snapshot.docs
      .map((doc) => (doc.data().email as string | undefined)?.toLowerCase().trim())
      .filter((email): email is string => !!email);
  } catch (error) {
    logError("password-reset:getAdditionalAdminEmails", error);
    return [];
  }
}

export async function logPasswordResetEvent(
  event: PasswordResetAuditEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    if (!adminDb) return;
    await adminDb.collection("admin_audit_logs").add({
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  } catch (error) {
    logError("password-reset:logPasswordResetEvent", error, {
      event,
      requestId: payload.requestId,
    });
  }
}

export type PasswordResetEmailContext = {
  email: string;
  emailLink: string;
  requestId: string;
  ip: string;
  userAgent?: string;
  location?: PasswordResetLocation;
  timestamp: string;
};

export async function sendPasswordResetEmail({
  email,
  emailLink,
  requestId,
  ip,
  userAgent,
  location,
  timestamp,
}: PasswordResetEmailContext): Promise<void> {
  if (isTestMode()) {
    return;
  }

  const fromAddress =
    serverEnv.SMTP_USER || serverEnv.ADMIN_EMAIL || "no-reply@example.com";
  const supportEmail =
    serverEnv.RSS_ADMIN_CONTACT ||
    serverEnv.ADMIN_EMAIL ||
    serverEnv.SMTP_USER ||
    "support@example.com";

  const transporter = nodemailer.createTransport({
    host: serverEnv.SMTP_HOST,
    port: Number(serverEnv.SMTP_PORT || 587),
    secure: serverEnv.SMTP_SECURE === "true",
    auth: serverEnv.SMTP_USER
      ? {
          user: serverEnv.SMTP_USER,
          pass: serverEnv.SMTP_PASS,
        }
      : undefined,
  });

  const locationParts = [location?.city, location?.region, location?.country]
    .filter(Boolean)
    .join(", ");
  const locationHint = locationParts || "Unknown location";
  const deviceHint = userAgent || "Unknown device";
  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    timeZone: "UTC",
    hour12: false,
  });

  const notYouHref = `mailto:${encodeURIComponent(
    supportEmail,
  )}?subject=${encodeURIComponent(
    "Unexpected admin password reset",
  )}&body=${encodeURIComponent(
    `Request ID: ${requestId}\nIP: ${ip}\nThis wasn't me.`,
  )}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="font-family: 'Poppins', sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);">
          <h1 style="font-size: 20px; margin-bottom: 12px; color: #0f172a;">Reset your admin password</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            A password reset was requested for your admin account. If this was you, click the button below to continue.
          </p>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${emailLink}" style="display: inline-block; padding: 12px 24px; font-size: 15px; color: #ffffff; background-color: #2563eb; border-radius: 8px; text-decoration: none;">Continue password reset</a>
          </p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            <strong>Request ID:</strong> ${requestId}<br />
            <strong>Time (UTC):</strong> ${formattedDate}<br />
            <strong>IP address:</strong> ${ip}<br />
            <strong>Approximate location:</strong> ${locationHint}<br />
            <strong>Device:</strong> ${deviceHint}
          </p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            If you did not request this reset, <a href="${notYouHref}" style="color: #2563eb;">let us know</a> so we can secure your account.
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">
            If the button doesn’t work, copy and paste this link into your browser:<br />
            <span style="word-break: break-all;">${emailLink}</span>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Reset your admin password\n\nA password reset was requested for your admin account.\n\nRequest ID: ${requestId}\nTime (UTC): ${formattedDate}\nIP address: ${ip}\nApproximate location: ${locationHint}\nDevice: ${deviceHint}\n\nContinue: ${emailLink}\nIf you did not request this reset, contact us at ${supportEmail}.`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Admin password reset instructions",
      html,
      text,
      replyTo: supportEmail,
    });
  } catch (error) {
    logError("password-reset:sendPasswordResetEmail", error, {
      requestId,
      email,
    });
  }
}

export function createRequestId(): string {
  return randomUUID();
}