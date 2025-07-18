// --- COMMENT STORE ---

import { adminDb } from "@/lib/firebase-admin"; // Place at top of your file

export const commentStore = {
  // Fetch all comments (across all posts), flattened list
  async getAll(): Promise<Comment[]> {
    try {
      const snap = await adminDb.collectionGroup("entries").get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Comment[];
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      throw new Error("Failed to fetch comments");
    }
  },

  // Get comments by postId and type (blog/video), approved only, newest first
  async getByPost(postId: string, postType: "blog" | "video"): Promise<Comment[]> {
    try {
      const snap = await adminDb
        .collection("comments")
        .doc(postId)
        .collection("entries")
        .where("postType", "==", postType)
        .where("status", "==", "approved")
        .orderBy("createdAt", "desc")
        .get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Comment[];
    } catch (error) {
      console.error(`Failed to fetch comments for post ${postId}:`, error);
      throw new Error("Failed to fetch comments for this post");
    }
  },

  // Create a new comment: runs Perspective moderation and saves with status
  async create(comment: Omit<Comment, "id" | "createdAt" | "status" | "scores">): Promise<Comment> {
    const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
    const THRESHOLD = 0.75; // Adjust as needed

    // --- Perspective Moderation ---
    let moderation: any = {};
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
        }
      ).then((res) => res.json());
    } catch (error) {
      console.error("Perspective API failed:", error);
      throw new Error("Comment moderation failed");
    }

    const scores = {
      toxicity: moderation.attributeScores?.TOXICITY?.summaryScore.value ?? 0,
      insult: moderation.attributeScores?.INSULT?.summaryScore.value ?? 0,
      threat: moderation.attributeScores?.THREAT?.summaryScore.value ?? 0,
    };

    const isFlagged =
      scores.toxicity > THRESHOLD ||
      scores.insult > THRESHOLD ||
      scores.threat > THRESHOLD;

    const status: Comment["status"] = isFlagged ? "pending" : "approved";

    // --- Store in Firestore ---
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status,
      scores,
    };

    try {
      await adminDb
        .collection("comments")
        .doc(comment.postId)
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
  async updateStatus(postId: string, commentId: string, status: Comment["status"]): Promise<Comment | null> {
    try {
      const ref = adminDb
        .collection("comments")
        .doc(postId)
        .collection("entries")
        .doc(commentId);

      await ref.update({ status });
      const doc = await ref.get();
      return doc.exists ? (doc.data() as Comment) : null;
    } catch (error) {
      console.error(`Failed to update status for comment ${commentId}:`, error);
      throw new Error("Failed to update comment status");
    }
  },

  // Delete a comment
  async delete(postId: string, commentId: string): Promise<boolean> {
    try {
      const ref = adminDb
        .collection("comments")
        .doc(postId)
        .collection("entries")
        .doc(commentId);

      await ref.delete();
      return true;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      return false;
    }
  },
};

// === ADDITIONAL EXPORTS FOR ADMIN STORES (required for API/build compatibility) ===
export { blogStore, videoStore, pageStore, initializeSampleData as initializeRealData } from "./content-store";
