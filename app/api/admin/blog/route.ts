import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const blogData = await request.json()

    // Generate ID if creating new post
    const id = blogData.id || `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const post = {
      ...blogData,
      id,
      createdAt: blogData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: blogData.views || 0,
    }

    // In a real implementation, this would save to Firestore
    // For now, we'll just return the post data
    console.log("Blog post saved:", post)

    return NextResponse.json({
      success: true,
      id,
      message: "Blog post saved successfully",
    })
  } catch (error) {
    console.error("Error saving blog post:", error)
    return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // In a real implementation, this would fetch from Firestore
    const posts = []

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
