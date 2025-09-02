import { onRequest } from "firebase-functions/v2/https";
import { db } from "../config";
import { FieldValue } from "firebase-admin/firestore";
import nodemailer from "nodemailer";
import { serverEnv } from "../../../env/server";

// Config variables (Firebase environment)
const config = serverEnv.FUNCTIONS_EMULATOR
  ? require("firebase-functions").config()
  : (global as any).firebaseConfig || {};
const PERSPECTIVE_API_KEY = config.perspective?.key as string;
const THRESHOLD = 0.7;
const notifyEnabled = config.notify?.new_submission === "true";
const adminEmailsEnv = config.admin?.emails;

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.smtp?.host,
  port: Number(config.smtp?.port || 587),
  secure: config.smtp?.secure === "true",
  auth: config.smtp?.user
    ? { user: config.smtp.user, pass: config.smtp.pass }
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

// The main contact endpoint
export const submitContact = onRequest(
  { cors: true }, // Enable CORS on the function!
  async (req, res) => {
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
        createdAt: FieldValue.serverTimestamp(),
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
            from: config.smtp?.user,
            to: recipients,
            subject: `New contact submission: ${subject}`,
            text: `${firstName} ${lastName} <${email}> wrote:\n\n${message}`,
          });
        } catch (err) {
          console.error("[CONTACT_NOTIFY_ERROR]", err);
        }
      }

      res.json({ success: true, flagged });
    } catch (err) {
      console.error("[CONTACT_POST_ERROR]", err);
      res.status(500).json({ error: "Failed to submit message" });
    }
  }
);
