import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store" // Use the correct store
import { logError } from "@/lib/log"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
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
    logError("admin/blogs:id:PUT", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const success = await blogStore.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    logError("admin/blogs:id:DELETE", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
