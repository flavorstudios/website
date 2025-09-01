// app/api/comments/submit/route.ts

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { serverEnv } from "@/env/server";

// --- CONFIG ---
const PERSPECTIVE_API_KEY = serverEnv.PERSPECTIVE_API_KEY!;
const THRESHOLD = 0.75; // Moderation strictness

// --- Moderate comment using Perspective API ---
async function moderateComment(text: string) {
  try {
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

    if (!response.ok) {
      // Perspective API failed, return scores as null for fail-safe handling
      return null;
    }

    const data = await response.json();
    const scores = {
      toxicity: data.attributeScores?.TOXICITY?.summaryScore.value ?? 0,
      insult: data.attributeScores?.INSULT?.summaryScore.value ?? 0,
      threat: data.attributeScores?.THREAT?.summaryScore.value ?? 0,
    };

    return scores;
  } catch (error) {
    // On error, return null to signal moderation issue
    console.error("[PERSPECTIVE_API_ERROR]", error);
    return null;
  }
}

// --- Handle POST (Comment Submission) ---
export async function POST(request: Request) {
  try {
    const {
      author,
      email,      // Optional for public
      website,
      content,
      postId,
      postType,   // "blog" or "video"
      parentId,
      ip,
      userAgent,
    } = await request.json();

    // Required fields check
    if (!author || !content || !postId || !postType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Moderate content
    const scores = await moderateComment(content);

    // Decide status
    let isFlagged: boolean;
    let status: "approved" | "pending";

    if (!scores) {
      // If moderation fails, default to pending/manual review
      isFlagged = true;
      status = "pending";
    } else {
      isFlagged =
        scores.toxicity > THRESHOLD ||
        scores.insult > THRESHOLD ||
        scores.threat > THRESHOLD;
      status = isFlagged ? "pending" : "approved";
    }

    // Firestore doc structure
    const newComment = {
      author: author || "Anonymous",
      email: email || "",
      website: website || "",
      content,
      postId,
      postType,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      ip: ip || "",
      userAgent: userAgent || "",
      flagged: isFlagged, // <-- Persist flagged status!
      status,
      scores: scores || {
        toxicity: null,
        insult: null,
        threat: null,
      },
    };

    // Store in Firestore
    const db = getAdminDb();
    const ref = db
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
      message: !scores
        ? "Comment submitted but could not be automatically moderated. Pending manual review."
        : isFlagged
        ? "Comment submitted but flagged for moderation."
        : "Comment submitted successfully.",
    });
  } catch (err) {
    console.error("[COMMENT_SUBMIT_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
