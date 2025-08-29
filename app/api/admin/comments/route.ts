import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// --- Local Comment type (adjust fields as per your schema) ---
type Comment = {
  id: string;
  postSlug: string;
  user?: string;
  content: string;
  status: "approved" | "pending" | "rejected";
  flagged?: boolean;
  createdAt: string;
  // [key: string]: any; // REMOVE this for better type safety!
};

// --- Fetch all flagged (and all) comments, grouped by postSlug (admin only) ---
export async function GET(request: NextRequest) {
  // Enforce admin access at the top
  if (!(await requireAdmin(request, "canManageComments"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    // Get all comment parent docs (each post's comments)
    const postsSnap = await db.collection("comments").get();
    let allComments: Comment[] = [];

    // Iterate through each post (slug = post ID)
    for (const postDoc of postsSnap.docs) {
      const slug = postDoc.id;
      const entriesSnap = await db
        .collection("comments")
        .doc(slug)
        .collection("entries")
        .orderBy("createdAt", "desc")
        .get();

      // Map entries to unified structure (typed)
      const comments: Comment[] = entriesSnap.docs.map((doc) => {
        const data = doc.data() as Omit<Comment, "id" | "postSlug">;
        return {
          id: doc.id,
          postSlug: slug,
          ...data,
        };
      });
      allComments = allComments.concat(comments);
    }

    // Sort: flagged first, then by newest date
    allComments.sort((a, b) => {
      const aFlagged = !!(a.flagged || a.status === "pending");
      const bFlagged = !!(b.flagged || b.status === "pending");
      if (aFlagged === bFlagged) {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return aFlagged ? -1 : 1;
    });

    // Optionally, only return flagged/pending comments (uncomment below if desired)
    // allComments = allComments.filter(c => c.flagged || c.status === "pending");

    return NextResponse.json({ comments: allComments });
  } catch (err) {
    console.error("[ADMIN_COMMENTS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
