import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/comment-store"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const data = await request.json()
    const blog = await blogStore.update(params.id, data)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    return NextResponse.json(blog)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const success = await blogStore.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
