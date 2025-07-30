import { NextRequest, NextResponse } from "next/server"
import { commentStore } from "@/lib/comment-store"
import type { Comment } from "@/lib/comment-store" // Now Comment is exported!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const postType = (searchParams.get("postType") as "blog" | "video") || "blog"

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 })
    }

    const comments = await commentStore.getByPost(postId, postType)
    const approved = comments.filter((c: Comment) => c.status === "approved")
    const result = approved.map((c: Comment) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt,
      status: c.status,
    }))

    const res = NextResponse.json(result)
    res.headers.set("Cache-Control", "public, max-age=60")
    return res
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { postId, author, content } = data
    const postType = (data.postType as "blog" | "video") || "blog"

    if (!postId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Implement rate limiting or spam protection
    const comment = await commentStore.create({
      postId,
      postType,
      author,
      email: "",
      website: "",
      content,
      parentId: null,
      ip: request.headers.get("x-forwarded-for") ?? "",
      userAgent: request.headers.get("user-agent") ?? "",
    })

    // If the comment isn't pending (shouldn't happen unless moderation logic is changed), force it
    if (comment.status !== "pending") {
      await commentStore.updateStatus(postId, comment.id, "pending")
      comment.status = "pending"
    }

    const { id, createdAt, status } = comment

    return NextResponse.json({ id, author, content, createdAt, status }, { status: 201 })
  } catch (error) {
    console.error("Failed to create comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
