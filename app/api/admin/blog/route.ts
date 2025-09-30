import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import type { BlogPost } from "@/lib/content-store"
import { blogStore, ADMIN_DB_UNAVAILABLE } from "@/lib/content-store"

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

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const blogData = await request.json()
    const session = await getSessionAndRole(request)
    const editor = session?.email || "unknown"

    let post: BlogPost | null = null

    // Normalize date fields on the server
    const nowIso = new Date().toISOString()
    const status: BlogPost["status"] | undefined = blogData?.status
    let normalizedScheduledFor: string | undefined
    let normalizedPublishedAt: string | undefined
    try {
      normalizedScheduledFor =
        status === "scheduled"
          ? parseOptionalIsoDate(blogData?.scheduledFor, "scheduledFor")
          : undefined
      normalizedPublishedAt =
        status === "published"
          ? parseOptionalIsoDate(blogData?.publishedAt, "publishedAt") ?? nowIso
          : undefined
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }

    if (blogData.id) {
      // Update existing post
      const { id, ...updates } = blogData
      post = await blogStore.update(
        id,
        {
          ...updates,
          categories: Array.isArray(updates.categories)
            ? updates.categories
            : [updates.category],
          // Server-authoritative timestamps
          updatedAt: nowIso,
          // Ensure dates are strings
          ...(normalizedPublishedAt ? { publishedAt: normalizedPublishedAt } : {}),
          ...(normalizedScheduledFor ? { scheduledFor: normalizedScheduledFor } : {}),
        },
        editor
      )
      if (!post) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      }
    } else {
      // Create new post
      const newId = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      post = await blogStore.create({
        ...blogData,
        categories: Array.isArray(blogData.categories)
          ? blogData.categories
          : [blogData.category],
        id: newId,
        // Server-authoritative timestamps
        createdAt: nowIso,
        updatedAt: nowIso,
        views: 0,
        // Ensure dates are strings at creation as well
        ...(normalizedPublishedAt ? { publishedAt: normalizedPublishedAt } : {}),
        ...(normalizedScheduledFor ? { scheduledFor: normalizedScheduledFor } : {}),
      })
    }

    return NextResponse.json(post, { status: blogData.id ? 200 : 201 })
  } catch (error) {
    console.error("Error saving blog post:", error)
    const message = (error as Error).message
    if (message === ADMIN_DB_UNAVAILABLE) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const posts: BlogPost[] = await blogStore.getAll()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
