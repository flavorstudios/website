// app/api/comments/submit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY!;
const threshold = 0.75; // Adjust this based on how strict you want moderation

async function moderateComment(text: string) {
  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text },
        requestedAttributes: {
          TOXICITY: {},
          INSULT: {},
          THREAT: {},
        },
        doNotStore: true,
      }),
    }
  );

  const data = await response.json();
  const scores = {
    toxicity: data.attributeScores.TOXICITY?.summaryScore.value || 0,
    insult: data.attributeScores.INSULT?.summaryScore.value || 0,
    threat: data.attributeScores.THREAT?.summaryScore.value || 0,
  };

  return scores;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, postSlug } = await request.json();

    if (!name || !email || !message || !postSlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const scores = await moderateComment(message);

    const isToxic =
      scores.toxicity > threshold ||
      scores.insult > threshold ||
      scores.threat > threshold;

    const docRef = adminDb
      .collection("comments")
      .doc(postSlug)
      .collection("entries")
      .doc();

    await docRef.set({
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      flagged: isToxic,
      scores,
    });

    return NextResponse.json({
      success: true,
      flagged: isToxic,
      message: isToxic
        ? "Comment submitted but flagged for moderation."
        : "Comment submitted successfully.",
    });
  } catch (err) {
    console.error("[COMMENT_SUBMIT_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
