import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import type { BlogPost } from "@/lib/content-store"
import { blogStore } from "@/lib/content-store"

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const blogData = await request.json()

    let post: BlogPost | null = null
    // If blogData has an id, update the post. Otherwise, create a new post.
    if (blogData.id) {
      const { id, ...updates } = blogData
      post = await blogStore.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      if (!post) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      }
    } else {
      const newId = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      post = await blogStore.create({
        ...blogData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
      })
    }

    return NextResponse.json(post, { status: blogData.id ? 200 : 201 })
  } catch (error) {
    console.error("Error saving blog post:", error)
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
