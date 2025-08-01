import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";
import nodemailer from "nodemailer";

// Initialize Nodemailer transporter from environment
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req, "canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    messageId?: string;
    to?: string;
    from?: string;
    subject?: string;
    message?: string;
  };

  try {
    payload = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messageId, to, from, subject, message } = payload;

  if (!to || !from || !subject || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Ensure from address matches allowed domain if specified
  const domain = process.env.EMAIL_DOMAIN || process.env.ADMIN_DOMAIN || "";
  if (domain && !from.toLowerCase().endsWith(`@${domain}`)) {
    return NextResponse.json({ error: "Invalid from address" }, { status: 400 });
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: message,
    });

    // Log outgoing email to Firestore
    try {
      await adminDb.collection("replies").add({
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
      await adminDb.collection("replies").add({
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