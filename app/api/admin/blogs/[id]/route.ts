import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store" // Use the correct store
import { logError } from "@/lib/log"
import { publishToUser } from "@/lib/sse-broker"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = params
  try {
    const data = await request.json()
    const session = await getSessionAndRole(request)
    const blog = await blogStore.update(id, data, session?.email || "unknown")
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    publishToUser("blog", "posts", {})
    return NextResponse.json(blog)
  } catch (error) {
    logError("admin/blogs:id:PUT", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = params
  try {
    const success = await blogStore.delete(id)
    if (!success) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    publishToUser("blog", "posts", {})
    return NextResponse.json({ success: true })
  } catch (error) {
    logError("admin/blogs:id:DELETE", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
