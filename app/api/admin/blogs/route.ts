import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store"

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const blogs = await blogStore.getAll()

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
    }))

    return NextResponse.json({ posts: formattedBlogs }, { status: 200 })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch blogs",
        posts: [], // Return empty array as fallback
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
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
        { status: 400 },
      )
    }

    // Generate slug if not provided
    const slug =
      blogData.slug ||
      blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const blog = await blogStore.create({
      title: blogData.title,
      slug,
      content: blogData.content,
      excerpt: blogData.excerpt || blogData.content.substring(0, 160) + "...",
      status: blogData.status || "draft",
      category: blogData.category || "Episodes",
      tags: blogData.tags || [],
      featuredImage: blogData.featuredImage || "",
      seoTitle: blogData.seoTitle || blogData.title,
      seoDescription: blogData.seoDescription || blogData.excerpt,
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
      { status: 500 },
    )
  }
}
