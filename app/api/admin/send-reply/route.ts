import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";
import nodemailer from "nodemailer";

type SendReplyPayload = {
  messageId?: string;
  to?: string;
  from?: string;
  subject?: string;
  message?: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin(req, "canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SendReplyPayload;

  try {
    payload = (await req.json()) as SendReplyPayload;
  } catch {
    // parameterless catch avoids no-unused-vars while keeping the catch block
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messageId, to, from, subject, message } = payload;

  if (!to || !from || !subject || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate allowed "from" addresses
  const allowedEnv =
    process.env.CONTACT_REPLY_EMAILS || process.env.ADMIN_EMAILS || "";
  const allowed = allowedEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(from.toLowerCase())) {
    return NextResponse.json(
      { error: "Invalid from address" },
      { status: 400 }
    );
  }

  // Map "from" to SMTP_USER_<NAME> and SMTP_PASS_<NAME>
  const prefix = from.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
  const smtpUser = process.env[`SMTP_USER_${prefix}`];
  const smtpPass = process.env[`SMTP_PASS_${prefix}`];

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      { error: "Missing SMTP credentials" },
      { status: 500 }
    );
  }

  // Build transporter with per-sender credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: smtpUser, pass: smtpPass },
  });

  const db = getAdminDb();
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: message,
    });

    // Log outgoing email to Firestore
    try {
      await db.collection("replies").add({
        messageId: messageId || null,
        to,
        from,
        subject,
        message,
        transportId: info.messageId,
        status: "sent",
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      logError("send-reply:log", logErr);
    }

    return NextResponse.json({ ok: true, id: info.messageId });
  } catch (err) {
    logError("send-reply", err);
    // Attempt to log failure
    try {
      await db.collection("replies").add({
        messageId: messageId || null,
        to,
        from,
        subject,
        message,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      logError("send-reply:log-error", logErr);
    }

    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
