export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// Fallback categories for when API calls fail
export const fallbackCategories: DynamicCategoriesResult = {
  blogCategories: [
    { name: "Anime News", slug: "anime-news", count: 0 },
    { name: "Reviews", slug: "reviews", count: 0 },
    { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
    { name: "Tutorials", slug: "tutorials", count: 0 },
  ],
  videoCategories: [
    { name: "Anime News", slug: "anime-news", count: 0 },
    { name: "Reviews", slug: "reviews", count: 0 },
    { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
    { name: "Tutorials", slug: "tutorials", count: 0 },
  ],
}

// Utility functions
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug)
}

export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Dynamic category fetching with real-time updates
export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const [blogsResponse, videosResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/api/admin/blogs`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }),
      fetch(`${baseUrl}/api/admin/videos`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }),
    ])

    let blogCategories: CategoryData[] = []
    let videoCategories: CategoryData[] = []

    // Process blog categories dynamically
    if (blogsResponse.status === "fulfilled" && blogsResponse.value.ok) {
      try {
        const blogsData = await blogsResponse.value.json()
        const posts = blogsData.posts || []
        const categoryMap = new Map<string, number>()

        posts
          .filter((post: any) => post.status === "published")
          .forEach((post: any) => {
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

        // Sort by count (most popular first) then by name
        blogCategories.sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.name.localeCompare(b.name)
        })
      } catch (error) {
        console.error("Error processing blog categories:", error)
      }
    }

    // Process video categories dynamically
    if (videosResponse.status === "fulfilled" && videosResponse.value.ok) {
      try {
        const videosData = await videosResponse.value.json()
        const videos = videosData.videos || []
        const categoryMap = new Map<string, number>()

        videos
          .filter((video: any) => video.status === "published")
          .forEach((video: any) => {
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

        // Sort by count (most popular first) then by name
        videoCategories.sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.name.localeCompare(b.name)
        })
      } catch (error) {
        console.error("Error processing video categories:", error)
      }
    }

    // Use fallback if no categories found, but merge with any dynamic ones
    const finalBlogCategories = blogCategories.length > 0 ? blogCategories : fallbackCategories.blogCategories
    const finalVideoCategories = videoCategories.length > 0 ? videoCategories : fallbackCategories.videoCategories

    return {
      blogCategories: finalBlogCategories,
      videoCategories: finalVideoCategories,
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return fallbackCategories
  }
}

// Server-side compatible function (alias for client function)
export const getDynamicCategories = getCategoriesWithFallback

// Client-side only function (alias for consistency)
export const getDynamicCategoriesClient = getCategoriesWithFallback
