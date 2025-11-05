import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { serverEnv } from "@/env/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  buildEmailSet,
  getEmailPrefixToken,
  normalizeEmail,
  splitEmailList,
  type NormalizedEmail,
} from "@/lib/email";
import { getAdminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

type SendReplySuccess = { ok: true; id: string };
type SendReplyError = { error: string };

const payloadSchema = z.object({
  messageId: z.string().trim().max(128).optional(),
  to: z.string().email().transform((value) => value.trim()),
  from: z.string().email().transform((value) => value.trim()),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(200, "Subject must be 200 characters or fewer.")
    .transform((value) => value.replace(/\r?\n+/g, " ")),
  message: z
    .string()
    .trim()
    .min(1, "Message body is required.")
    .max(10_000, "Message body exceeds the allowed length."),
});

type SendReplyPayload = z.infer<typeof payloadSchema>;

type RateEntry = {
  readonly count: number;
  readonly resetAt: number;
};

declare global {
  var __adminSendReplyRateMap: Map<string, RateEntry> | undefined;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 20;

const rateMap: Map<string, RateEntry> =
  globalThis.__adminSendReplyRateMap ??
  (globalThis.__adminSendReplyRateMap = new Map());

const allowedSenders: ReadonlySet<NormalizedEmail> = buildEmailSet(
  splitEmailList(serverEnv.CONTACT_REPLY_EMAILS),
  splitEmailList(serverEnv.ADMIN_EMAILS),
  splitEmailList(serverEnv.ADMIN_EMAIL),
);

const readEnvValue = (key: string): string | undefined =>
  (serverEnv as Record<string, string | undefined>)[key];

const formatZodErrors = (payload: z.ZodError<SendReplyPayload>): string =>
  payload.issues
    .map((issue) => issue.message)
    .filter((message, index, list) => list.indexOf(message) === index)
    .join("; ");

const getRateKey = (sender: NormalizedEmail): string => `send-reply:${sender}`;

const isRateLimited = (key: string): boolean => {
  const entry = rateMap.get(key);
  if (!entry) {
    return false;
  }

  if (entry.resetAt <= Date.now()) {
    rateMap.delete(key);
    return false;
  }

  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
};

const recordAttempt = (key: string): void => {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt <= now) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  rateMap.set(key, { count: entry.count + 1, resetAt: entry.resetAt });
};

export async function POST(
  req: NextRequest,
): Promise<NextResponse<SendReplySuccess | SendReplyError>> {
  if (!(await requireAdmin(req, "canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodErrors(parsed.error) || "Invalid payload." },
      { status: 400 },
    );
  }

  if (allowedSenders.size === 0) {
    logError("send-reply:config", new Error("No allowed senders configured."));
    return NextResponse.json(
      { error: "No reply senders are configured. Contact an administrator." },
      { status: 500 },
    );
  }

  const data = parsed.data;
  const normalizedFrom = normalizeEmail(data.from);
  const normalizedTo = normalizeEmail(data.to);

  if (!allowedSenders.has(normalizedFrom)) {
    return NextResponse.json(
      { error: "Sender address is not authorized." },
      { status: 400 },
    );
  }

  const rateKey = getRateKey(normalizedFrom);
  if (isRateLimited(rateKey)) {
    return NextResponse.json(
      { error: "Too many replies sent recently. Please wait and try again." },
      { status: 429 },
    );
  }

  recordAttempt(rateKey);

  const smtpUserKey = `SMTP_USER_${getEmailPrefixToken(normalizedFrom)}`;
  const smtpPassKey = `SMTP_PASS_${getEmailPrefixToken(normalizedFrom)}`;
  const smtpUser = readEnvValue(smtpUserKey);
  const smtpPass = readEnvValue(smtpPassKey);

  if (!smtpUser || !smtpPass) {
    logError("send-reply:smtp-credentials", undefined, {
      smtpUserKey,
      smtpPassKey,
    });
    return NextResponse.json(
      { error: "SMTP credentials for the sender are not configured." },
      { status: 500 },
    );
  }

  const smtpHost = serverEnv.SMTP_HOST;
  const smtpPortValue = serverEnv.SMTP_PORT ?? "587";
  const smtpPort = Number.parseInt(smtpPortValue, 10);

  if (!smtpHost || Number.isNaN(smtpPort)) {
    return NextResponse.json(
      { error: "SMTP server configuration is invalid." },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: serverEnv.SMTP_SECURE === "true",
    auth: { user: smtpUser, pass: smtpPass },
  });

  let db;
  try {
    db = getAdminDb();
  } catch (error) {
    logError("send-reply:db", error);
    return NextResponse.json(
      { error: "Admin database is not configured for logging." },
      { status: 500 },
    );
  }

  const messageId = data.messageId ?? null;
  const subject = data.subject;
  const textBody = data.message;
  try {

    const info = await transporter.sendMail({
      from: normalizedFrom,
      to: normalizedTo,
      subject,
      text: textBody,
    });

    try {
      await db.collection("replies").add({
        messageId,
        to: normalizedTo,
        from: normalizedFrom,
        subject,
        message: textBody,
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

    try {
      await db.collection("replies").add({
        messageId,
        to: normalizedTo,
        from: normalizedFrom,
        subject,
        message: textBody,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      logError("send-reply:log-error", logErr);
    }

    return NextResponse.json(
      { error: "Failed to send reply email." },
      { status: 500 },
    );
  }
}