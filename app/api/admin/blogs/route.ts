import { NextResponse } from "next/server"
import { blogStore } from "@/lib/blog"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const categorySlug = url.searchParams.get("category") || "all"

    // Fetch all published blogs
    let posts = await blogStore.getAllPosts()

    // Filter by category if not 'all'
    if (categorySlug !== "all") {
      posts = posts.filter(post => post.category === categorySlug)
    }

    // Ensure only published posts
    posts = posts.filter(post => post.status === "published")

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Failed to fetch blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
