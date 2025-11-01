import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { commentStore } from "@/lib/comment-store";
import { logActivity } from "@/lib/activity-log";
import type { RouteContext } from "@/types/route";

// Updated route handlers to use both postId and commentId

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<{ postId: string; commentId: string }>
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId, commentId } = await params;
  try {
    const body = await request.json();
    if (body.status) {
      await commentStore.updateStatus(postId, commentId, body.status);
    }
    if (typeof body.flagged === "boolean") {
      await commentStore.updateFlag(postId, commentId, body.flagged);
    }
    const actor = await getSessionInfo(request);
    await logActivity({
      type: "comment.update",
      title: commentId,
      description: `Updated comment ${commentId} on post ${postId}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<{ postId: string; commentId: string }>
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId, commentId } = await params;
  try {
    const success = await commentStore.delete(postId, commentId);
    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    const actor = await getSessionInfo(request);
    await logActivity({
      type: "comment.delete",
      title: commentId,
      description: `Deleted comment ${commentId} on post ${postId}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

