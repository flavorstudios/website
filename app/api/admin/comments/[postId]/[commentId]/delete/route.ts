// app/api/admin/comments/[postId]/[commentId]/delete/route.ts

import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/activity-log";
import type { RouteContext } from "@/types/route";

// DELETE /api/admin/comments/[postId]/[commentId]/delete
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext<{ postId: string; commentId: string }>
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { postId, commentId } = await params;
  try {
    const db = getAdminDb();
    const entryRef = db
      .collection("comments")
      .doc(postId)
      .collection("entries")
      .doc(commentId);

    await entryRef.delete();
    const actor = await getSessionInfo(req);
    await logActivity({
      type: "comment.delete",
      title: commentId,
      description: `Deleted comment ${commentId} on post ${postId}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_COMMENT]", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
