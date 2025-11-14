import { type NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";
import { serverEnv } from "@/env/server";
import { handleOptionsRequest } from "@/lib/api/cors";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { logError } from "@/lib/log";

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

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["POST"] });
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);
  try {
    const {
      firstName = "",
      lastName = "",
      email = "",
      skills = "",
      portfolio = "",
      message = "",
    } = await request.json();

    if (!email) {
      return errorResponse(context, { error: "Email is required" }, 400);
    }

    const data = {
      firstName,
      lastName,
      email,
      skills,
      portfolio,
      message,
      createdAt: new Date().toISOString(),
      reviewed: false,
    };

    const db = getAdminDb();
    const ref = db.collection("careerSubmissions").doc();
    await ref.set({ id: ref.id, ...data });

    // === Notify all admins if enabled ===
    if (notifyEnabled && adminEmailsEnv) {
      const recipients = adminEmailsEnv
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .join(",");
      try {
        await transporter.sendMail({
          from: serverEnv.SMTP_USER,
          to: recipients,
          subject: "New career submission",
          text: `${firstName} ${lastName} <${email}> applied.\nSkills: ${skills}\nPortfolio: ${portfolio}\n\n${message}`,
        });
      } catch (err) {
        logError("career:notify", err, { requestId: context.requestId });
        // Do not fail the request if notification email fails
      }
    }

    return jsonResponse(context, { success: true });
  } catch (err) {
    logError("career:submit", err, { requestId: context.requestId });
    return errorResponse(context, { error: "Server error" }, 500);
  }
}
