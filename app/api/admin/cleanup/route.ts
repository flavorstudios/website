import { NextResponse } from "next/server"
import { blogStore, videoStore, VALID_BLOG_CATEGORIES, VALID_WATCH_CATEGORIES } from "@/lib/content-store"

export async function POST() {
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
          video.youtubeId.includes(keyword) ||
          video.slug?.toLowerCase().includes(keyword),
      )

      if (isDummy) {
        const success = await videoStore.delete(video.id)
        if (success) deletedVideos++
      }
    }

    // Clean up invalid categories (this returns the count of deleted items)
    const deletedBlogCategories = await blogStore.cleanupInvalidCategories()
    const deletedVideoCategories = await videoStore.cleanupInvalidCategories()

    const report = {
      blogPostsDeleted: deletedBlogs,
      blogCategoriesDeleted: deletedBlogCategories,
      watchVideosDeleted: deletedVideos,
      watchCategoriesDeleted: deletedVideoCategories,
      validBlogCategories: VALID_BLOG_CATEGORIES,
      validWatchCategories: VALID_WATCH_CATEGORIES,
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
