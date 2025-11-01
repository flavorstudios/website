// app/api/admin/comments/[postId]/[commentId]/approve/route.ts

import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/activity-log";
import type { RouteContext } from "@/types/route";

// PATCH /api/admin/comments/[postId]/[commentId]/approve
export async function PATCH(
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

    await entryRef.update({ flagged: false });
    const actor = await getSessionInfo(req);
    await logActivity({
      type: "comment.approve",
      title: commentId,
      description: `Approved comment ${commentId} on post ${postId}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[APPROVE_COMMENT]", err);
    return NextResponse.json({ error: "Failed to approve comment" }, { status: 500 });
  }
}

