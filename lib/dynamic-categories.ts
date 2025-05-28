// Client-side only implementation for dynamic categories
export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// Server-side compatible function (alias for client function)
export async function getDynamicCategories(): Promise<DynamicCategoriesResult> {
  return getDynamicCategoriesClient()
}

// Client-side function for browser usage
export async function getDynamicCategoriesClient(): Promise<DynamicCategoriesResult> {
  try {
    const [blogResponse, videoResponse] = await Promise.allSettled([
      fetch("/api/admin/blogs").catch(() => ({ ok: false, json: () => Promise.resolve({ posts: [] }) })),
      fetch("/api/admin/videos").catch(() => ({ ok: false, json: () => Promise.resolve({ videos: [] }) })),
    ])

    let blogData = { posts: [] }
    let videoData = { videos: [] }

    if (blogResponse.status === "fulfilled" && blogResponse.value.ok) {
      blogData = await blogResponse.value.json()
    }

    if (videoResponse.status === "fulfilled" && videoResponse.value.ok) {
      videoData = await videoResponse.value.json()
    }

    const blogPosts = blogData.posts || []
    const videos = videoData.videos || []

    // Extract and count blog categories
    const blogCategoryMap = new Map<string, number>()
    blogPosts.forEach((post: any) => {
      if (post.category && post.status === "published") {
        const count = blogCategoryMap.get(post.category) || 0
        blogCategoryMap.set(post.category, count + 1)
      }
    })

    // Extract and count video categories
    const videoCategoryMap = new Map<string, number>()
    videos.forEach((video: any) => {
      if (video.category && video.status === "published") {
        const count = videoCategoryMap.get(video.category) || 0
        videoCategoryMap.set(video.category, count + 1)
      }
    })

    // Convert to CategoryData format
    const blogCategories: CategoryData[] = Array.from(blogCategoryMap.entries()).map(([name, count]) => ({
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      count,
    }))

    const videoCategories: CategoryData[] = Array.from(videoCategoryMap.entries()).map(([name, count]) => ({
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      count,
    }))

    return {
      blogCategories: blogCategories.sort((a, b) => b.count - a.count),
      videoCategories: videoCategories.sort((a, b) => b.count - a.count),
    }
  } catch (error) {
    console.error("Failed to get dynamic categories (client):", error)
    return fallbackCategories
  }
}

// Fallback categories for when API fails
export const fallbackCategories: DynamicCategoriesResult = {
  blogCategories: [
    { name: "Anime News", slug: "anime-news", count: 0 },
    { name: "Reviews", slug: "reviews", count: 0 },
    { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
    { name: "Tutorials", slug: "tutorials", count: 0 },
  ],
  videoCategories: [
    { name: "Original Anime", slug: "original-anime", count: 0 },
    { name: "Short Films", slug: "short-films", count: 0 },
    { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
    { name: "Tutorials & Guides", slug: "tutorials-guides", count: 0 },
  ],
}

// Helper function to get categories with fallback
export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  try {
    const categories = await getDynamicCategoriesClient()

    // If no categories found, use fallback
    if (categories.blogCategories.length === 0 && categories.videoCategories.length === 0) {
      return fallbackCategories
    }

    return categories
  } catch (error) {
    console.error("Failed to get categories, using fallback:", error)
    return fallbackCategories
  }
}

// Utility function to create slug from category name
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Utility function to get category by slug
export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((category) => category.slug === slug)
}

// Utility function to format category display name
export function formatCategoryName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
