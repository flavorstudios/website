// app/api/comments/submit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// --- CONFIG ---
const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY!;
const THRESHOLD = 0.75; // Moderation strictness

// --- Moderate comment using Perspective API ---
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
    toxicity: data.attributeScores?.TOXICITY?.summaryScore.value ?? 0,
    insult: data.attributeScores?.INSULT?.summaryScore.value ?? 0,
    threat: data.attributeScores?.THREAT?.summaryScore.value ?? 0,
  };

  return scores;
}

// --- Handle POST (Comment Submission) ---
export async function POST(request: NextRequest) {
  try {
    const {
      author,
      email,
      website,
      content,
      postId,
      postType,    // "blog" or "video"
      parentId,
      ip,
      userAgent,
    } = await request.json();

    // Required fields check
    if (!author || !email || !content || !postId || !postType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Moderate content
    const scores = await moderateComment(content);

    // Decide status
    const isFlagged =
      scores.toxicity > THRESHOLD ||
      scores.insult > THRESHOLD ||
      scores.threat > THRESHOLD;

    const status: "approved" | "pending" = isFlagged ? "pending" : "approved";

    // Firestore doc structure
    const newComment = {
      author,
      email,
      website: website || "",
      content,
      postId,
      postType,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      ip: ip || "",
      userAgent: userAgent || "",
      status,
      scores,
    };

    // Store in Firestore
    const ref = adminDb
      .collection("comments")
      .doc(postId)
      .collection("entries")
      .doc();

    await ref.set({
      ...newComment,
      id: ref.id,
    });

    return NextResponse.json({
      success: true,
      status,
      flagged: isFlagged,
      message: isFlagged
        ? "Comment submitted but flagged for moderation."
        : "Comment submitted successfully.",
    });
  } catch (err) {
    console.error("[COMMENT_SUBMIT_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
