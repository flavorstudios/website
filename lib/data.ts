export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  author: string
  featured: boolean
  imageUrl?: string
}

export interface Video {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  featured: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count?: number
}

const defaultCategories: Category[] = [
  { id: "1", name: "All", slug: "all", description: "All content" },
  { id: "2", name: "Anime News", slug: "anime-news", description: "Latest anime news and updates" },
  { id: "3", name: "Reviews", slug: "reviews", description: "Anime and manga reviews" },
  { id: "4", name: "Behind the Scenes", slug: "behind-the-scenes", description: "Behind the scenes content" },
  { id: "5", name: "Tutorials", slug: "tutorials", description: "How-to guides and tutorials" },
]

export async function getDynamicCategories(): Promise<Category[]> {
  try {
    // Try to fetch from API first
    const response = await fetch("/api/admin/categories", {
      cache: "no-store",
    })

    if (response.ok) {
      const categories = await response.json()
      if (categories && categories.length > 0) {
        return categories
      }
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories:", error)
  }

  // Return default categories as fallback
  return defaultCategories
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/api/admin/blogs", {
      cache: "no-store",
    })

    if (response.ok) {
      const posts = await response.json()
      return posts || []
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts:", error)
  }

  return []
}

export async function getVideos(): Promise<Video[]> {
  try {
    const response = await fetch("/api/admin/videos", {
      cache: "no-store",
    })

    if (response.ok) {
      const videos = await response.json()
      return videos || []
    }
  } catch (error) {
    console.warn("Failed to fetch videos:", error)
  }

  return []
}
