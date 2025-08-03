import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";
import { z } from "zod";

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY!;
const THRESHOLD = 0.7;

const notifyEnabled = process.env.NOTIFY_NEW_SUBMISSION === "true";
const adminEmailsEnv = process.env.ADMIN_EMAILS;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

// ✅ Zod schema for validation
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

async function moderateText(text: string) {
  try {
    const res = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: { TOXICITY: {}, INSULT: {}, THREAT: {} },
          doNotStore: true,
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      toxicity: data.attributeScores?.TOXICITY?.summaryScore.value ?? 0,
      insult: data.attributeScores?.INSULT?.summaryScore.value ?? 0,
      threat: data.attributeScores?.THREAT?.summaryScore.value ?? 0,
    };
  } catch (error) {
    console.error("[PerspectiveAPI]", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate input using zod
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, subject, message } = parsed.data;

    const scores = await moderateText(message);
    const flagged = scores
      ? scores.toxicity > THRESHOLD || scores.insult > THRESHOLD || scores.threat > THRESHOLD
      : true;

    const docRef = adminDb.collection("contactMessages").doc();
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

    // === Notify all admins if enabled ===
    if (notifyEnabled && adminEmailsEnv) {
      const recipients = adminEmailsEnv
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .join(",");
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: recipients,
          subject: `New contact submission: ${subject}`,
          text: `${firstName} ${lastName} <${email}> wrote:\n\n${message}`,
        });
      } catch (err) {
        console.error('[CONTACT_NOTIFY_ERROR]', err);
        // Don't block user if email fails
      }
    }

    return NextResponse.json({ success: true, flagged });
  } catch (error) {
    console.error("[CONTACT_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
