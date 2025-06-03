// /lib/blog.ts

import type { BlogPost, Category, Video } from "./data"

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : "" // browser fetch can use relative URLs

// Utility: Gets full API URL for SSR/SSG or client-side
function getApiUrl(path: string) {
  return typeof window === "undefined"
    ? `${BASE_URL}${path}`
    : path
}

// Blog Posts
export const blogStore = {
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const response = await fetch(getApiUrl("/api/admin/blogs"), {
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
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const posts = await this.getAllPosts()
      return posts.find((post) => post?.slug === slug) || null
    } catch (error) {
      console.warn("Failed to fetch blog post:", error)
      return null
    }
  },

  async getPostsByCategory(category: string): Promise<BlogPost[]> {
    try {
      const posts = await this.getAllPosts()
      if (category === "all") return posts
      return posts.filter((post) => post.category === category)
    } catch (error) {
      console.warn("Failed to fetch blog posts by category:", error)
      return []
    }
  },

  async getFeaturedPosts(): Promise<BlogPost[]> {
    try {
      const posts = await this.getAllPosts()
      return posts.filter((post) => post.featured)
    } catch (error) {
      console.warn("Failed to fetch featured blog posts:", error)
      return []
    }
  },
}

// Categories
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch(getApiUrl("/api/admin/categories"), {
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
  // Fallback to default categories
  return (await import("./data")).defaultCategories
}

// Videos
export async function getVideos(): Promise<Video[]> {
  try {
    const response = await fetch(getApiUrl("/api/admin/videos"), {
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
