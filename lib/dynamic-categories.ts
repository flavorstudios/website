import { blogStore, videoStore } from "./content-store"

export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

export async function getDynamicCategories(): Promise<DynamicCategoriesResult> {
  try {
    // Fetch all published content
    const [blogPosts, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Extract and count blog categories
    const blogCategoryMap = new Map<string, number>()
    blogPosts.forEach((post: any) => {
      if (post.category) {
        const count = blogCategoryMap.get(post.category) || 0
        blogCategoryMap.set(post.category, count + 1)
      }
    })

    // Extract and count video categories
    const videoCategoryMap = new Map<string, number>()
    videos.forEach((video: any) => {
      if (video.category) {
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
      blogCategories: blogCategories.sort((a, b) => b.count - a.count), // Sort by count descending
      videoCategories: videoCategories.sort((a, b) => b.count - a.count),
    }
  } catch (error) {
    console.error("Failed to get dynamic categories:", error)
    return {
      blogCategories: [],
      videoCategories: [],
    }
  }
}

// Client-side version for browser usage
export async function getDynamicCategoriesClient(): Promise<DynamicCategoriesResult> {
  try {
    const [blogResponse, videoResponse] = await Promise.all([
      fetch("/api/admin/blogs").catch(() => ({ json: () => ({ posts: [] }) })),
      fetch("/api/admin/videos").catch(() => ({ json: () => ({ videos: [] }) })),
    ])

    const [blogData, videoData] = await Promise.all([blogResponse.json(), videoResponse.json()])

    const blogPosts = blogData.posts || []
    const videos = videoData.videos || []

    // Extract and count blog categories
    const blogCategoryMap = new Map<string, number>()
    blogPosts.forEach((post: any) => {
      if (post.category) {
        const count = blogCategoryMap.get(post.category) || 0
        blogCategoryMap.set(post.category, count + 1)
      }
    })

    // Extract and count video categories
    const videoCategoryMap = new Map<string, number>()
    videos.forEach((video: any) => {
      if (video.category) {
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
    return {
      blogCategories: [],
      videoCategories: [],
    }
  }
}
