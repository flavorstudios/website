import { NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store"

export async function GET() {
  try {
    const blogs = await blogStore.getAll()

    const formattedBlogs = blogs.map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      published: blog.status === 'published',
      publishedAt: blog.publishedAt,
      updatedAt: blog.updatedAt,
      createdAt: blog.createdAt,
    }))

    return NextResponse.json({ blogs: formattedBlogs }, { status: 200 })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
