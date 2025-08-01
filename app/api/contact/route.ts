import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY!;
const THRESHOLD = 0.7;

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
    const { firstName, lastName, email, subject, message } = await request.json();

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, flagged });
  } catch (error) {
    console.error("[CONTACT_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}