import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"

// Static categories that match your screenshot
const FALLBACK_CATEGORIES = [
  { name: "Anime News", slug: "anime-news", count: 0 },
  { name: "Reviews", slug: "reviews", count: 0 },
  { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
  { name: "Tutorials", slug: "tutorials", count: 0 },
]

function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export async function GET() {
  try {
    // Try to get real data from content stores
    const [posts, videos] = await Promise.allSettled([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    let blogCategories = FALLBACK_CATEGORIES
    let videoCategories = FALLBACK_CATEGORIES

    // Process blog categories if we have posts
    if (posts.status === "fulfilled" && posts.value.length > 0) {
      const categoryMap = new Map<string, number>()

      posts.value.forEach((post: any) => {
        if (post.category) {
          const slug = createCategorySlug(post.category)
          categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
        }
      })

      if (categoryMap.size > 0) {
        blogCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
          name: formatCategoryName(slug),
          slug,
          count,
        }))

        // Sort by count (most popular first) then by name
        blogCategories.sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.name.localeCompare(b.name)
        })
      }
    }

    // Process video categories if we have videos
    if (videos.status === "fulfilled" && videos.value.length > 0) {
      const categoryMap = new Map<string, number>()

      videos.value.forEach((video: any) => {
        if (video.category) {
          const slug = createCategorySlug(video.category)
          categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
        }
      })

      if (categoryMap.size > 0) {
        videoCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
          name: formatCategoryName(slug),
          slug,
          count,
        }))

        // Sort by count (most popular first) then by name
        videoCategories.sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.name.localeCompare(b.name)
        })
      }
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
        blogCategories: FALLBACK_CATEGORIES,
        videoCategories: FALLBACK_CATEGORIES,
      },
      { status: 500 },
    )
  }
}
