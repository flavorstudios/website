import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { commentStore } from "@/lib/comment-store";

// Updated route handlers to use both postId and commentId

export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId, commentId } = params;
  try {
    const body = await request.json();
    if (body.status) {
      await commentStore.updateStatus(postId, commentId, body.status);
    }
    if (typeof body.flagged === "boolean") {
      await commentStore.updateFlag(postId, commentId, body.flagged);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId, commentId } = params;
  try {
    const success = await commentStore.delete(postId, commentId);
    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

