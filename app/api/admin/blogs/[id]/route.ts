import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import type { BlogPost } from "@/lib/content-store"
import { blogStore, ADMIN_DB_UNAVAILABLE } from "@/lib/content-store" // Use the correct store
import { logError } from "@/lib/log"
import { publishToUser } from "@/lib/sse-broker"
import { logActivity } from "@/lib/activity-log"
import { revalidatePath } from "next/cache"
import type { RouteContext } from "@/types/route"

function parseOptionalIsoDate(value: unknown, field: string): string | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value !== "string") {
    throw new Error(`Invalid ${field} timestamp`)
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${field} timestamp`)
  }
  return date.toISOString()
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const data = await request.json()
    let scheduledForIso: string | undefined
    let publishedAtIso: string | undefined
    try {
      scheduledForIso = parseOptionalIsoDate(data.scheduledFor, "scheduledFor")
      publishedAtIso = parseOptionalIsoDate(data.publishedAt, "publishedAt")
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
    const rawUpdates = { ...data }
    delete rawUpdates.scheduledFor
    delete rawUpdates.publishedAt
    const session = await getSessionAndRole(request)
    const existing = await blogStore.getById(id)
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const incomingSlug = typeof data.slug === "string" ? data.slug : undefined
    if (incomingSlug && existing.slug && incomingSlug !== existing.slug) {
      revalidatePath(`/blog/${existing.slug}`)
    }

    const resolvedCategories = Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories
      : typeof data.category === "string" && data.category.trim().length > 0
        ? [data.category]
        : Array.isArray(existing.categories) && existing.categories.length > 0
          ? existing.categories
          : [existing.category]

    const updates: Partial<BlogPost> = {
      ...rawUpdates,
      categories: resolvedCategories,
    }
    if (!updates.category) {
      updates.category = existing.category
    }
    if (scheduledForIso !== undefined) {
      updates.scheduledFor = scheduledForIso
    }
    if (publishedAtIso !== undefined) {
      updates.publishedAt = publishedAtIso
    } else {
      const nextStatus = (updates.status ?? existing.status) as BlogPost["status"]
      if (nextStatus === "scheduled") {
        delete updates.publishedAt
      }
    }

    const blog = await blogStore.update(
      id,
      updates,
      session?.email || "unknown"
    )
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    publishToUser("blog", "posts", {})
    if (blog.status === "published" || existing.status === "published") {
      revalidatePath("/blog")
      if (blog.slug) {
        revalidatePath(`/blog/${blog.slug}`)
      }
    }
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
  { params }: RouteContext<{ id: string }>
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
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
