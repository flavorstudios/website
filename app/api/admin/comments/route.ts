import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Fetch all flagged comments, grouped by postSlug
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const postsSnap = await adminDb.collection("comments").get();
    let allComments: any[] = [];

    for (const postDoc of postsSnap.docs) {
      const slug = postDoc.id;
      const entriesSnap = await adminDb
        .collection("comments")
        .doc(slug)
        .collection("entries")
        .orderBy("createdAt", "desc")
        .get();
      const comments = entriesSnap.docs.map((doc) => ({
        id: doc.id,
        postSlug: slug,
        ...doc.data(),
      }));
      allComments = allComments.concat(comments);
    }

    // Sort: flagged first, then by date
    allComments.sort((a, b) => {
      if (a.flagged === b.flagged) {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return a.flagged ? -1 : 1;
    });

    return NextResponse.json({ comments: allComments });
  } catch (err) {
    console.error("[ADMIN_COMMENTS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
