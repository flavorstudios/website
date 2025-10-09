import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import type { BlogPost } from "@/lib/content-store"
import { blogStore, ADMIN_DB_UNAVAILABLE } from "@/lib/content-store" // <-- Updated as per Codex
import { publishToUser } from "@/lib/sse-broker"  // <-- Added for SSE broadcast
import { logActivity } from "@/lib/activity-log"
import { hasE2EBypass } from "@/lib/e2e-utils"
import { getE2EBlogPosts } from "@/lib/e2e-fixtures"

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

// GET: Fetch all blogs for admin dashboard (with filtering, sorting, pagination)
export async function GET(request: NextRequest) {
  const bypass = hasE2EBypass(request)

  if (!bypass && !(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const search = (searchParams.get("search") || "").toLowerCase()
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const sort = searchParams.get("sort") || "date"
    const sortDir = (searchParams.get("sortDir") || "desc").toLowerCase()
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const authorParam = (searchParams.get("author") || "").toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const PER_PAGE = Math.max(
      1,
      parseInt(searchParams.get("perPage") || "10", 10) || 10,
    )

    const fromDate = fromParam ? new Date(fromParam).getTime() : null
    const toDate = toParam ? new Date(toParam).getTime() : null

    const blogs = bypass ? getE2EBlogPosts() : await blogStore.getAll()

    // Apply filters
    const filtered = blogs.filter((blog: any) => {
      const inCategory =
        category === "all" ||
        blog.category === category ||
        (Array.isArray(blog.categories) && blog.categories.includes(category))
      const inStatus = status === "all" || blog.status === status
      const matchesAuthor =
        !authorParam || String(blog.author || "").toLowerCase().includes(authorParam)
      const matchesSearch =
        !search ||
        String(blog.title || "").toLowerCase().includes(search) ||
        String(blog.content || "").toLowerCase().includes(search)
      const date = new Date(blog.publishedAt || blog.createdAt).getTime()
      const inRange =
        (fromDate === null || date >= fromDate) &&
        (toDate === null || date <= toDate)
      return inCategory && inStatus && matchesSearch && matchesAuthor && inRange
    })

    // Sort
    filtered.sort((a: any, b: any) => {
      let comp = 0
      if (sort === "title") comp = String(a.title).localeCompare(String(b.title))
      else if (sort === "status") comp = String(a.status).localeCompare(String(b.status))
      else if (sort === "views") comp = (a.views || 0) - (b.views || 0)
      else if (sort === "comments") comp = (a.commentCount || 0) - (b.commentCount || 0)
      else {
        const aDate = new Date(a.publishedAt || a.createdAt).getTime()
        const bDate = new Date(b.publishedAt || b.createdAt).getTime()
        comp = aDate - bDate
      }
      return sortDir === "asc" ? comp : -comp
    })

    const total = filtered.length

    // Paginate
    const start = (page - 1) * PER_PAGE
    const paginated = filtered.slice(start, start + PER_PAGE)

    // Return all relevant fields for admin UI
    const formattedBlogs = paginated.map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      status: blog.status,
      category: blog.category,
      categories: blog.categories, // include if present
      tags: blog.tags,
      featuredImage: blog.featuredImage,
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      author: blog.author,
      publishedAt: blog.publishedAt,
      scheduledFor: blog.scheduledFor,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      views: blog.views,
      readTime: blog.readTime,
      commentCount: blog.commentCount ?? 0, // Always return a number
      shareCount: blog.shareCount ?? 0,     // Always return a number
    }))

    return NextResponse.json({ posts: formattedBlogs, total }, { status: 200 })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch blogs",
        posts: [],
        total: 0,
      },
      { status: 500 }
    )
  }
}

// POST: Create a new blog post
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const blogData = await request.json()

    // Validate required fields
    if (!blogData.title || !blogData.content) {
      return NextResponse.json(
        {
          error: "Title and content are required",
        },
        { status: 400 }
      )
    }

    // Generate a safe slug
    const slug =
      blogData.slug ||
      blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    // Always strip HTML for the excerpt!
    const plain =
      typeof blogData.content === "string"
        ? blogData.content.replace(/<[^>]*>/g, "")
        : ""
    const generatedExcerpt =
      plain.length > 160 ? plain.substring(0, 160) + "..." : plain
    const excerpt = blogData.excerpt || generatedExcerpt

    // Create the blog post
    let scheduledForIso: string | undefined
    let publishedAtIso: string | undefined
    try {
      scheduledForIso = parseOptionalIsoDate(blogData.scheduledFor, "scheduledFor")
      publishedAtIso = parseOptionalIsoDate(blogData.publishedAt, "publishedAt")
    } catch (error) {
      return NextResponse.json(
        {
          error: (error as Error).message || "Invalid timestamp",
        },
        { status: 400 },
      )
    }

    const status: BlogPost["status"] =
      blogData.status === "published" || blogData.status === "scheduled"
        ? blogData.status
        : "draft"
    const nowIso = new Date().toISOString()
    const computedPublishedAt =
      status === "published"
        ? publishedAtIso ?? nowIso
        : publishedAtIso ?? (status === "scheduled" ? scheduledForIso ?? nowIso : nowIso)

    const blog = await blogStore.create({
      title: blogData.title,
      slug,
      content: blogData.content,
      excerpt,
      status,
      category: blogData.category || "Episodes",
      categories: Array.isArray(blogData.categories)
        ? blogData.categories
        : [blogData.category || "Episodes"],
      tags: blogData.tags || [],
      featuredImage: blogData.featuredImage || "",
      seoTitle: blogData.seoTitle || blogData.title,
      seoDescription: blogData.seoDescription || excerpt,
      author: blogData.author || "Flavor Studios",
      publishedAt: computedPublishedAt,
      readTime: blogData.readTime || "5 min read",
      scheduledFor: scheduledForIso,
      // commentCount and shareCount default to 0 by the store model
    })

    // Notify connected admin clients via SSE
    publishToUser("blog", "posts", {})

    const actor = await getSessionInfo(request)
    await logActivity({
      type: "blog.create",
      title: blog.title,
      description: `Created blog ${blog.title}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    })

    if (blog.status === "published") {
      revalidatePath("/blog")
      if (blog.slug) {
        revalidatePath(`/blog/${blog.slug}`)
      }
    }

    return NextResponse.json(
      {
        ...blog,
        commentCount: blog.commentCount ?? 0,
        shareCount: blog.shareCount ?? 0,
        scheduledFor: blog.scheduledFor,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating blog:", error)
    const message = (error as Error).message
    if (message === ADMIN_DB_UNAVAILABLE) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    return NextResponse.json(
      {
        error: "Failed to create blog",
      },
      { status: 500 }
    )
  }
}
