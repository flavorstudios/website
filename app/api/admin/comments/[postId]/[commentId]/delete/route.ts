// app/api/admin/comments/[postId]/[commentId]/delete/route.ts

import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// DELETE /api/admin/comments/[postId]/[commentId]/delete
export async function DELETE(
  req: NextRequest,
  context: { params: { postId: string; commentId: string } }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { postId, commentId } = context.params;
  try {
    const db = getAdminDb();
    const entryRef = db
      .collection("comments")
      .doc(postId)
      .collection("entries")
      .doc(commentId);

    await entryRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_COMMENT]", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
