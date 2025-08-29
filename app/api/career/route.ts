import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";

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

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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
          from: process.env.SMTP_USER,
          to: recipients,
          subject: "New career submission",
          text: `${firstName} ${lastName} <${email}> applied.\nSkills: ${skills}\nPortfolio: ${portfolio}\n\n${message}`,
        });
      } catch (err) {
        console.error("[CAREER_NOTIFY_ERROR]", err);
        // Do not fail the request if notification email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CAREER_SUBMISSION_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
