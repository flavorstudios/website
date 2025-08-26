import { requireAdmin } from "@/lib/admin-auth"
import { commentStore } from "@/lib/comment-store"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { postId, commentId } = await params
  try {
    const body = await request.json()
    const { content, postType } = body as {
      content: string
      postType: "blog" | "video"
    }
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 })
    }
    const reply = await commentStore.create({
      postId,
      postType,
      author: "Admin",
      content,
      parentId: commentId,
    })
    return NextResponse.json({ comment: reply })
  } catch (err) {
    console.error("[ADMIN_REPLY]", err)
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 })
  }
}