import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

setGlobalOptions({ region: "us-central1" });

admin.initializeApp();
const db = admin.firestore();

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY as string;
const THRESHOLD = 0.7;
const notifyEnabled = process.env.NOTIFY_NEW_SUBMISSION === "true";
const adminEmailsEnv = process.env.ADMIN_EMAILS;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// Perspective API moderation
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
  } catch (err) {
    console.error("[PerspectiveAPI]", err);
    return null;
  }
}

// Firebase HTTPS Function for Contact Form
export const submitContact = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  try {
    const { firstName, lastName, email, subject, message } = req.body;

      if (!firstName || !lastName || !email || !subject || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

      const scores = await moderateText(message);
    const flagged = scores
      ? scores.toxicity > THRESHOLD ||
        scores.insult > THRESHOLD ||
        scores.threat > THRESHOLD
      : true;

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
        .map((e: string) => e.trim())
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
        console.error("[CONTACT_NOTIFY_ERROR]", err);
      }
    }

    res.json({ success: true, flagged });
    return;
  } catch (err) {
    console.error("[CONTACT_POST_ERROR]", err);
    res.status(500).json({ error: "Failed to submit message" });
    return;
  }
});
