import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { blogStore, ADMIN_DB_UNAVAILABLE } from "@/lib/content-store" // Use the correct store
import { logError } from "@/lib/log"
import { publishToUser } from "@/lib/sse-broker"
import { logActivity } from "@/lib/activity-log"

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = context.params
  try {
    const data = await request.json()
    const session = await getSessionAndRole(request)
    const blog = await blogStore.update(id, data, session?.email || "unknown")
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    publishToUser("blog", "posts", {})
    await logActivity({
      type: "blog.update",
      title: blog.title || id,
      description: `Updated blog ${id}`,
      status: "success",
      user: session?.email || session?.uid || "unknown",
    })
    return NextResponse.json(blog)
  } catch (error) {
    logError("admin/blogs:id:PUT", error)
    const message = (error as Error).message
    if (message === ADMIN_DB_UNAVAILABLE) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = context.params
  try {
    const session = await getSessionAndRole(request)
    const success = await blogStore.delete(id)
    if (!success) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    publishToUser("blog", "posts", {})
    await logActivity({
      type: "blog.delete",
      title: id,
      description: `Deleted blog ${id}`,
      status: "success",
      user: session?.email || session?.uid || "unknown",
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logError("admin/blogs:id:DELETE", error)
    const message = (error as Error).message
    if (message === ADMIN_DB_UNAVAILABLE) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
