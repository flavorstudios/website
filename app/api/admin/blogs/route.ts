import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store" // <-- Updated as per Codex
import { publishToUser } from "@/lib/sse-broker"  // <-- Added for SSE broadcast

// GET: Fetch all blogs for admin dashboard (with filtering, sorting, pagination)
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const search = (searchParams.get("search") || "").toLowerCase()
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const sort = searchParams.get("sort") || "date"
    const authorParam = (searchParams.get("author") || "").toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const PER_PAGE = Math.max(
      1,
      parseInt(searchParams.get("perPage") || "10", 10) || 10,
    )

    const blogs = await blogStore.getAll()

    // Apply filters
    let filtered = blogs.filter((blog: any) => {
      const inCategory =
        category === "all" ||
        blog.category === category ||
        (Array.isArray(blog.categories) && blog.categories.includes(category))
      const inStatus = status === "all" || blog.status === status
      const matchesAuthor =
        !authorParam || String(blog.author || "").toLowerCase().includes(authorParam)
      return inCategory && inStatus && matchesSearch && matchesAuthor
      return inCategory && inStatus && matchesSearch
    })

    // Sort
    filtered.sort((a: any, b: any) => {
      if (sort === "title") return String(a.title).localeCompare(String(b.title))
      if (sort === "status") return String(a.status).localeCompare(String(b.status))
      if (sort === "views") return (b.views || 0) - (a.views || 0)
      if (sort === "comments") return (b.commentCount || 0) - (a.commentCount || 0)
      const aDate = new Date(a.publishedAt || a.createdAt).getTime()
      const bDate = new Date(b.publishedAt || b.createdAt).getTime()
      return bDate - aDate // newest first
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
    const blog = await blogStore.create({
      title: blogData.title,
      slug,
      content: blogData.content,
      excerpt,
      status: blogData.status || "draft",
      category: blogData.category || "Episodes",
      tags: blogData.tags || [],
      featuredImage: blogData.featuredImage || "",
      seoTitle: blogData.seoTitle || blogData.title,
      seoDescription: blogData.seoDescription || excerpt,
      author: blogData.author || "Flavor Studios",
      publishedAt: blogData.publishedAt || new Date().toISOString(),
      readTime: blogData.readTime || "5 min read",
      // commentCount and shareCount default to 0 by the store model
    })

    // Notify connected admin clients via SSE
    publishToUser("blog", "posts", {})

    return NextResponse.json({
      blog: {
        ...blog,
        commentCount: blog.commentCount ?? 0,
        shareCount: blog.shareCount ?? 0,
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json(
      {
        error: "Failed to create blog",
      },
      { status: 500 }
    )
  }
}
