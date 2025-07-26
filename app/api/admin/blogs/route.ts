import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/comment-store"

// GET: Fetch all blogs for admin dashboard
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const blogs = await blogStore.getAll()

    // Return all relevant fields for admin UI
    const formattedBlogs = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      status: blog.status,
      category: blog.category,
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
    }))

    return NextResponse.json({ posts: formattedBlogs }, { status: 200 })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch blogs",
        posts: [],
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

    const excerpt =
      blogData.excerpt ||
      (blogData.content.length > 160
        ? blogData.content.substring(0, 160) + "..."
        : blogData.content)

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
    })

    return NextResponse.json({ blog }, { status: 201 })
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
