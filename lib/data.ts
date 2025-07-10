// lib/data.ts or lib/dynamic-data.ts

// --- DATA TYPES ---

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
  type?: string // Add if your API provides type ("BLOG" | "VIDEO")
}

// --------- CATEGORY FETCH (PRISMA-ONLY, API-DRIVEN) ---------
// Always fetch categories from API (no local fallback)

export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories", { // Updated to /api/categories
      cache: "no-store",
    })
    if (response.ok) {
      const data = await response.json()
      // Support both new ({ blogCategories, videoCategories }) and old ([...categories]) API shapes
      if (Array.isArray(data)) return data
      if (data.blogCategories || data.videoCategories) {
        const blog = Array.isArray(data.blogCategories) ? data.blogCategories : []
        const video = Array.isArray(data.videoCategories) ? data.videoCategories : []
        return [...blog, ...video]
      }
      return []
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories from Prisma:", error)
  }
  return []
}

// --------- BLOG POSTS FETCH (PRISMA-ONLY, API-DRIVEN) ---------

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

// --------- VIDEOS FETCH (PRISMA-ONLY, API-DRIVEN) ---------

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

// --------- DEPRECATED: STATIC CATEGORY FETCH ---------

/** @deprecated Use getDynamicCategories instead. Always returns []. */
export function getStaticCategories(): Category[] {
  return []
}
