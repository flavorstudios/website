// --- COMMENT STORE ---

import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";
import type { PerspectiveResponse } from "@/types/perspective";
import { serverEnv } from "@/env/server";

// --- Define and export Comment type ---
interface BaseComment {
  id: string;
  postId: string; // blog/video post id
  postSlug?: string; // optional: for convenience
  postType: "blog" | "video"; // <-- Required!
  author?: string; // commenter name
  user?: string; // user id or name (optional)
  email?: string;
  website?: string;
  content: string;
  parentId?: string | null;
  ip?: string;
  userAgent?: string;
  status: "approved" | "pending" | "rejected" | "spam" | "trash";
  scores?: {
    toxicity?: number;
    insult?: number;
    threat?: number;
    [key: string]: number | undefined;
  };
  flagged?: boolean;
  createdAt: string;
  }

export type Comment = BaseComment & Record<string, unknown>;

// Utility: Type for Firestore comment doc (wider than our Comment, but type-safe)
type FirestoreCommentDoc =
  Omit<BaseComment, "id"> & { id?: string } & Record<string, unknown>;

// --- COMMENT STORE LOGIC ---
export const commentStore = {
  // Fetch all comments (across all posts), flattened list
  async getAll(): Promise<Comment[]> {
    try {
      const db = getAdminDb();
      const snap = await db.collectionGroup("entries").get();
      return snap.docs.map(
        (doc): Comment => ({
          id: doc.id,
          ...(doc.data() as FirestoreCommentDoc),
        })
      );
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      throw new Error("Failed to fetch comments");
    }
  },

  // Get comments by postId and type (blog/video), approved only, newest first
  async getByPost(postId: string, postType: "blog" | "video"): Promise<Comment[]> {
    try {
      const db = getAdminDb();
      const snap = await db
        .collection("comments")
        .doc(String(postId))
        .collection("entries")
        .where("postType", "==", postType)
        .where("status", "==", "approved")
        .orderBy("createdAt", "desc")
        .get();
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as FirestoreCommentDoc),
      })) as Comment[];
    } catch (error) {
      console.error("Failed to fetch comments for post %s:", String(postId), error);
      throw new Error("Failed to fetch comments for this post");
    }
  },

  // Create a new comment: runs Perspective moderation and saves with status
  async create(
    comment: Omit<Comment, "id" | "createdAt" | "status" | "scores">
  ): Promise<Comment> {
    const PERSPECTIVE_API_KEY = serverEnv.PERSPECTIVE_API_KEY;
    const THRESHOLD = 0.75;

    // --- Perspective Moderation ---
    let moderation: PerspectiveResponse | null = null;

    if (!PERSPECTIVE_API_KEY) {
      console.warn(
        "Perspective API key not configured; comments will require manual review.",
      );
    } else {
      try {
        moderation = await fetch(
          `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comment: { text: comment.content },
              requestedAttributes: {
                TOXICITY: {},
                INSULT: {},
                THREAT: {},
              },
              doNotStore: true,
            }),
          },
        ).then((res) => res.json());
      } catch (error) {
        console.error("Perspective API failed:", error);
        throw new Error("Comment moderation failed");
      }
    }

    // --- Access moderation scores from strongly typed response
    const attr = moderation?.attributeScores;

    const toxicity = attr?.TOXICITY?.summaryScore.value;
    const insult = attr?.INSULT?.summaryScore.value;
    const threat = attr?.THREAT?.summaryScore.value;

    const hasScores =
      typeof toxicity === "number" ||
      typeof insult === "number" ||
      typeof threat === "number";

    const scores = hasScores
      ? {
          toxicity: toxicity ?? 0,
          insult: insult ?? 0,
          threat: threat ?? 0,
        }
      : undefined;

    const isFlagged =
      !!scores &&
      (scores.toxicity > THRESHOLD ||
        scores.insult > THRESHOLD ||
        scores.threat > THRESHOLD);

    const status: Comment["status"] =
      hasScores && !isFlagged ? "approved" : "pending";

    // --- Ensure all required fields are present for Comment type ---
    const newComment = {
      ...comment,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status,
      ...(scores ? { scores } : {}),
    } as Comment;

    try {
      const db = getAdminDb();
      await db
        .collection("comments")
        .doc(String(comment.postId))
        .collection("entries")
        .doc(newComment.id)
        .set(newComment);
      return newComment;
    } catch (error) {
      console.error("Failed to store new comment:", error);
      throw new Error("Failed to store comment");
    }
  },

  // Update comment status (approve/spam/etc)
  async updateStatus(
    postId: string,
    commentId: string,
    status: Comment["status"]
  ): Promise<Comment | null> {
    try {
      const db = getAdminDb();
      const ref = db
        .collection("comments")
        .doc(String(postId))
        .collection("entries")
        .doc(commentId);

      await ref.update({ status });
      const doc = await ref.get();
      if (!doc.exists) return null;
      return { id: doc.id, ...(doc.data() as FirestoreCommentDoc) } as Comment;
    } catch (error) {
      console.error(
        "Failed to update status for comment %s:",
        String(commentId),
        error,
      );
      throw new Error("Failed to update comment status");
    }
  },

  // Toggle flagged state on a comment
  async updateFlag(
    postId: string,
    commentId: string,
    flagged: boolean
  ): Promise<Comment | null> {
    try {
      const db = getAdminDb();
      const ref = db
        .collection("comments")
        .doc(String(postId))
        .collection("entries")
        .doc(commentId);

      await ref.update({ flagged });
      const doc = await ref.get();
      if (!doc.exists) return null;
      return { id: doc.id, ...(doc.data() as FirestoreCommentDoc) } as Comment;
    } catch (error) {
      console.error("Failed to update flag for comment", { commentId, error });
      throw new Error("Failed to update comment flag");
    }
  },

  // Delete a comment
  async delete(postId: string, commentId: string): Promise<boolean> {
    try {
      const db = getAdminDb();
      const ref = db
        .collection("comments")
        .doc(String(postId))
        .collection("entries")
        .doc(commentId);

      await ref.delete();
      return true;
    } catch (error) {
      console.error("Failed to delete comment", { commentId, error });
      return false;
    }
  },
};