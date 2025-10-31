import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import type { BlogPost } from "@/lib/content-store"
import { isCiLike } from "@/lib/env/is-ci-like"
import {
  hasE2EBypass,
  addE2EBlogPost,
  getE2EBlogPostById,
  getE2EBlogPosts,
  updateE2EBlogPost,
} from "@/lib/e2e-fixtures"

// lazy loader so CI/e2e doesn’t pay for Firestore/content-store on every cold hit
type ContentStoreModule = typeof import("@/lib/content-store")

let contentStorePromise: Promise<ContentStoreModule> | null = null

async function loadContentStore(): Promise<ContentStoreModule> {
  if (!contentStorePromise) {
    contentStorePromise = import("@/lib/content-store")
  }
  return contentStorePromise
}

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
  // 1) CI / e2e short path: stay in memory, no Firestore, no content-store
  if (hasE2EBypass(request)) {
    const nowIso = new Date().toISOString()
    const payload = await request.json()
    const status: BlogPost["status"] =
      payload?.status === "scheduled" || payload?.status === "published"
        ? payload.status
        : "draft"

    const normalized: BlogPost = {
      id:
        typeof payload?.id === "string" && payload.id.trim().length > 0
          ? payload.id.trim()
          : `blog-e2e-${Date.now()}`,
      title: payload?.title ?? "Untitled Post",
      slug:
        payload?.slug?.trim?.() ||
        (payload?.title || "untitled")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      content: typeof payload?.content === "string" ? payload.content : "",
      excerpt:
        typeof payload?.excerpt === "string" && payload.excerpt.trim().length > 0
          ? payload.excerpt
          : (payload?.content || "")
              .replace(/<[^>]*>/g, "")
              .slice(0, 160),
      status,
      category: payload?.category || "Announcements",
      categories: Array.isArray(payload?.categories)
        ? payload.categories
        : [payload?.category || "Announcements"],
      tags: Array.isArray(payload?.tags) ? payload.tags : [],
      featuredImage: payload?.featuredImage || "/cover.jpg",
      seoTitle: payload?.seoTitle || payload?.title || "Untitled Post",
      seoDescription:
        payload?.seoDescription ||
        "Preview environment post used for automated testing.",
      author: payload?.author || "Flavor Studios Editorial",
      publishedAt:
        payload?.publishedAt && typeof payload.publishedAt === "string"
          ? new Date(payload.publishedAt).toISOString()
          : nowIso,
      scheduledFor:
        payload?.scheduledFor && typeof payload.scheduledFor === "string"
          ? new Date(payload.scheduledFor).toISOString()
          : undefined,
      createdAt:
        payload?.createdAt && typeof payload.createdAt === "string"
          ? new Date(payload.createdAt).toISOString()
          : nowIso,
      updatedAt: nowIso,
      views: typeof payload?.views === "number" ? payload.views : 0,
      readTime: payload?.readTime || "4 min",
      commentCount: typeof payload?.commentCount === "number" ? payload.commentCount : 0,
      shareCount: typeof payload?.shareCount === "number" ? payload.shareCount : 0,
      schemaType: payload?.schemaType || "Article",
      openGraphImage: payload?.openGraphImage || "/cover.jpg",
    }

    const existing = getE2EBlogPostById(normalized.id)
    if (existing) {
      const updated = updateE2EBlogPost(normalized.id, {
        ...normalized,
        updatedAt: nowIso,
      })
      return NextResponse.json(updated, { status: 200 })
    }

    const created = addE2EBlogPost(normalized)
    return NextResponse.json(created, { status: 201 })
  }

  // 2) normal admin path -> needs permission + real content-store
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // load AFTER the CI/e2e branch so CI doesn’t pull Firestore
  const { blogStore, ADMIN_DB_UNAVAILABLE } = await loadContentStore()

  try {
    const blogData = await request.json()
    const session = await getSessionAndRole(request)
    const editor = session?.email || "unknown"

    let post: BlogPost | null = null

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
          updatedAt: nowIso,
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
        createdAt: nowIso,
        updatedAt: nowIso,
        views: 0,
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
  // For CI / E2E and for ?e2e bypasses, don’t touch Firestore at all
  if (isCiLike() || hasE2EBypass(request)) {
    return NextResponse.json({ posts: getE2EBlogPosts() })
  }

  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { blogStore } = await loadContentStore()
    const posts: BlogPost[] = await blogStore.getAll()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
