import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";
import { z } from "zod";
import { handleOptionsRequest } from "@/lib/api/cors";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
  type RequestContext,
} from "@/lib/api/response";
import { logError } from "@/lib/log";

const rawExternalBackendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const externalBackendBase = rawExternalBackendBase
  ? rawExternalBackendBase.trim().replace(/\/$/, "")
  : "";

function respondWithExternalRedirect(context: RequestContext) {
  if (!externalBackendBase) return null;
  return jsonResponse(
    context,
    {
      error: "This route now lives on the standalone backend.",
      next: `${externalBackendBase}/contact`,
    },
    { status: 410 },
  );
}

const THRESHOLD = 0.7;

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type ModerationScores = {
  toxicity: number;
  insult: number;
  threat: number;
};

async function moderateText(
  text: string,
  context: RequestContext,
  perspectiveApiKey?: string,
): Promise<ModerationScores | null> {
  if (!perspectiveApiKey) {
    logError("contact:moderate:config", undefined, {
      requestId: context.requestId,
      message:
        "Perspective API key missing; intentionally skipping moderation but continuing request",
    });
    return null;
  }

  try {
    const res = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspectiveApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": context.requestId,
        },
        cache: "no-store",
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: { TOXICITY: {}, INSULT: {}, THREAT: {} },
          doNotStore: true,
        }),
      },
    );

    if (!res.ok) {
      logError("contact:moderate:response", undefined, {
        requestId: context.requestId,
        status: res.status,
      });
      return null;
    }

    const data = await res.json();
    return {
      toxicity: data.attributeScores?.TOXICITY?.summaryScore.value ?? 0,
      insult: data.attributeScores?.INSULT?.summaryScore.value ?? 0,
      threat: data.attributeScores?.THREAT?.summaryScore.value ?? 0,
    };
  } catch (error) {
    logError("contact:moderate:error", error, { requestId: context.requestId });
    return null;
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["POST"] });
}

export async function POST(request: NextRequest | Request) {
  const context = createRequestContext(request);

  const redirect = respondWithExternalRedirect(context);
  if (redirect) {
    return redirect;
  }

  const { serverEnv } = await import("@/env/server");

  const notifyEnabled = serverEnv.NOTIFY_NEW_SUBMISSION === "true";
  const adminEmailsEnv = serverEnv.ADMIN_EMAILS;

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

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        context,
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, subject, message } = parsed.data;

    const scores = await moderateText(
      message,
      context,
      serverEnv.PERSPECTIVE_API_KEY,
    );
    const flagged = scores
      ? scores.toxicity > THRESHOLD ||
        scores.insult > THRESHOLD ||
        scores.threat > THRESHOLD
      : false;

    const db = getAdminDb();
    const docRef = db.collection("contactMessages").doc();
    await docRef.set({
      id: docRef.id,
      firstName,
      lastName,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      flagged,
      scores: scores || null,
    });

    if (notifyEnabled && adminEmailsEnv) {
      const recipients = adminEmailsEnv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .join(",");

      try {
        await transporter.sendMail({
          from: serverEnv.SMTP_USER,
          to: recipients,
          subject: `New contact submission: ${subject}`,
          text: `${firstName} ${lastName} <${email}> wrote:\n\n${message}`,
        });
      } catch (error) {
        logError("contact:notify", error, { requestId: context.requestId });
      }
    }

    return jsonResponse(context, { success: true, flagged });
  } catch (error) {
    logError("contact:post", error, { requestId: context.requestId });
    return errorResponse(context, { error: "Failed to submit message" }, 500);
  }
}
