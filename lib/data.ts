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

// --------- PRISMA-ONLY CATEGORY FETCH ---------
// All categories must now be loaded dynamically via API/Prisma. No local fallback.

export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/admin/categories", {
      cache: "no-store",
    })
    if (response.ok) {
      const categories = await response.json()
      return Array.isArray(categories) ? categories : []
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories from Prisma:", error)
  }
  // No fallback! If failed, just return an empty array.
  return []
}

// --------- BLOG POSTS (from API/Prisma) ---------
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/api/admin/blogs", {
      cache: "no-store",
    })
    if (response.ok) {
      const posts = await response.json()
      return Array.isArray(posts) ? posts : []
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts:", error)
  }
  return []
}

// --------- VIDEOS (from API/Prisma) ---------
export async function getVideos(): Promise<Video[]> {
  try {
    const response = await fetch("/api/admin/videos", {
      cache: "no-store",
    })
    if (response.ok) {
      const videos = await response.json()
      return Array.isArray(videos) ? videos : []
    }
  } catch (error) {
    console.warn("Failed to fetch videos:", error)
  }
  return []
}
