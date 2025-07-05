import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"

export async function GET() {
  try {
    // Get all published blog posts and videos
    const [posts, videos] = await Promise.allSettled([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    let blogCategories: { name: string; slug: string; count: number }[] = []
    let videoCategories: { name: string; slug: string; count: number }[] = []

    // Helper to slugify and format names
    const createCategorySlug = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const formatCategoryName = (slug: string) =>
      slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

    // Blog categories
    if (posts.status === "fulfilled" && posts.value.length > 0) {
      const categoryMap = new Map<string, number>()
      posts.value.forEach((post: any) => {
        if (post.category) {
          const slug = createCategorySlug(post.category)
          categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
        }
      })

      blogCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
        name: formatCategoryName(slug),
        slug,
        count,
      }))

      blogCategories.sort((a, b) => (b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name)))
    }

    // Video categories
    if (videos.status === "fulfilled" && videos.value.length > 0) {
      const categoryMap = new Map<string, number>()
      videos.value.forEach((video: any) => {
        if (video.category) {
          const slug = createCategorySlug(video.category)
          categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
        }
      })

      videoCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
        name: formatCategoryName(slug),
        slug,
        count,
      }))

      videoCategories.sort((a, b) => (b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name)))
    }

    return NextResponse.json({
      success: true,
      blogCategories,
      videoCategories,
    })
  } catch (error) {
    console.error("Failed to get categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get categories",
        blogCategories: [],
        videoCategories: [],
      },
      { status: 500 },
    )
  }
}
