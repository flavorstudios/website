import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// --- Fetch all flagged (and all) comments, grouped by postSlug (admin only) ---
export async function GET(request: NextRequest) {
  // Enforce admin access at the top
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all comment parent docs (each post's comments)
    const postsSnap = await adminDb.collection("comments").get();
    let allComments: any[] = [];

    // Iterate through each post (slug = post ID)
    for (const postDoc of postsSnap.docs) {
      const slug = postDoc.id;
      const entriesSnap = await adminDb
        .collection("comments")
        .doc(slug)
        .collection("entries")
        .orderBy("createdAt", "desc")
        .get();

      // Map entries to unified structure
      const comments = entriesSnap.docs.map((doc) => ({
        id: doc.id,
        postSlug: slug,
        ...doc.data(),
      }));
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
