import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/comment-store"

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // Get current counts before cleanup
    const allBlogs = await blogStore.getAll()
    const allVideos = await videoStore.getAll()

    // Filter out any dummy/test content
    const dummyBlogKeywords = [
      "lorem ipsum",
      "test",
      "sample",
      "dummy",
      "placeholder",
      "fake",
      "demo",
      "example",
      "coming soon",
      "mystic chronicles",
      "neon dreams",
    ]

    const dummyVideoKeywords = [
      "test",
      "sample",
      "dummy",
      "placeholder",
      "fake",
      "demo",
      "example",
      "coming soon",
      "dQw4w9WgXcQ", // Rick Roll video ID
      "showreel",
      "akira",
      "studio tour",
    ]

    let deletedBlogs = 0
    let deletedVideos = 0

    // Delete dummy blog posts
    for (const blog of allBlogs) {
      const isDummy = dummyBlogKeywords.some(
        (keyword) =>
          blog.title.toLowerCase().includes(keyword) ||
          blog.content.toLowerCase().includes(keyword) ||
          blog.excerpt.toLowerCase().includes(keyword) ||
          blog.slug.toLowerCase().includes(keyword),
      )
      if (isDummy) {
        const success = await blogStore.delete(blog.id)
        if (success) deletedBlogs++
      }
    }

    // Delete dummy videos
    for (const video of allVideos) {
      const isDummy = dummyVideoKeywords.some(
        (keyword) =>
          video.title.toLowerCase().includes(keyword) ||
          video.description.toLowerCase().includes(keyword) ||
          (video.youtubeId && video.youtubeId.includes(keyword)) ||
          (video.slug && video.slug.toLowerCase().includes(keyword)),
      )
      if (isDummy) {
        const success = await videoStore.delete(video.id)
        if (success) deletedVideos++
      }
    }

    // Clean up invalid categories (optional: update to only use Prisma categories if those helpers exist)
    let deletedBlogCategories = 0
    let deletedVideoCategories = 0
    if (typeof blogStore.cleanupInvalidCategories === "function") {
      deletedBlogCategories = await blogStore.cleanupInvalidCategories()
    }
    if (typeof videoStore.cleanupInvalidCategories === "function") {
      deletedVideoCategories = await videoStore.cleanupInvalidCategories()
    }

    // If you want to display the latest categories, fetch dynamically from your Prisma-powered API or content-store
    // For demo, just leave empty arrays (or fetch via Prisma here)
    const currentBlogCategories: string[] = []
    const currentWatchCategories: string[] = []

    const report = {
      blogPostsDeleted: deletedBlogs,
      blogCategoriesDeleted: deletedBlogCategories,
      watchVideosDeleted: deletedVideos,
      watchCategoriesDeleted: deletedVideoCategories,
      validBlogCategories: currentBlogCategories,
      validWatchCategories: currentWatchCategories,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      report,
    })
  } catch (error) {
    console.error("Cleanup failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
