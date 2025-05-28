import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    const formattedBlogs = blogs.map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      published: blog.published,
      publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
      updatedAt: blog.updatedAt.toISOString(),
      createdAt: blog.createdAt.toISOString(),
    }))

    return NextResponse.json({ blogs: formattedBlogs }, { status: 200 })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
