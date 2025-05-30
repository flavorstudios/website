export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// Static categories that ALWAYS appear - matching your screenshot exactly
const STATIC_CATEGORIES: CategoryData[] = [
  { name: "Anime News", slug: "anime-news", count: 0 },
  { name: "Reviews", slug: "reviews", count: 0 },
  { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
  { name: "Tutorials", slug: "tutorials", count: 0 },
]

// Fallback categories for when API calls fail
export const fallbackCategories: DynamicCategoriesResult = {
  blogCategories: STATIC_CATEGORIES,
  videoCategories: STATIC_CATEGORIES,
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

// ALWAYS return categories - but prioritize dynamic content
export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  // Start with empty arrays to prioritize dynamic content
  let blogCategories: CategoryData[] = []
  let videoCategories: CategoryData[] = []

  try {
    // Use relative URLs instead of absolute URLs to avoid environment variable issues
    const apiUrls = {
      blogs: "/api/admin/blogs",
      videos: "/api/admin/videos",
    }

    // Try to fetch dynamic data but don't fail if it doesn't work
    const [blogsResponse, videosResponse] = await Promise.allSettled([
      fetch(apiUrls.blogs, {
        cache: "no-store",
        next: { revalidate: 0 },
      }).catch(() => null),
      fetch(apiUrls.videos, {
        cache: "no-store",
        next: { revalidate: 0 },
      }).catch(() => null),
    ])

    // Process blog categories if available
    if (blogsResponse.status === "fulfilled" && blogsResponse.value && blogsResponse.value.ok) {
      try {
        const blogsData = await blogsResponse.value.json()
        const posts = blogsData.posts || []

        if (posts.length > 0) {
          const categoryMap = new Map<string, number>()

          posts
            .filter((post: any) => post.status === "published")
            .forEach((post: any) => {
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
      } catch (error) {
        console.warn("Error processing blog categories, using static fallback:", error)
      }
    }

    // Process video categories if available
    if (videosResponse.status === "fulfilled" && videosResponse.value && videosResponse.value.ok) {
      try {
        const videosData = await videosResponse.value.json()
        const videos = videosData.videos || []

        if (videos.length > 0) {
          const categoryMap = new Map<string, number>()

          videos
            .filter((video: any) => video.status === "published")
            .forEach((video: any) => {
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
      } catch (error) {
        console.warn("Error processing video categories, using static fallback:", error)
      }
    }
  } catch (error) {
    console.warn("Failed to fetch categories, using static fallback:", error)
  }

  // Return dynamic categories if available, otherwise use static fallback
  return {
    blogCategories: blogCategories.length > 0 ? blogCategories : STATIC_CATEGORIES,
    videoCategories: videoCategories.length > 0 ? videoCategories : STATIC_CATEGORIES,
  }
}

// Server-side compatible function (alias for client function)
export const getDynamicCategories = getCategoriesWithFallback

// Client-side only function (alias for consistency)
export const getDynamicCategoriesClient = getCategoriesWithFallback
