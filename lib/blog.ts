// /lib/blog.ts

import type { BlogPost, Category, Video } from "./data"

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : ""

function getApiUrl(path: string) {
  return typeof window === "undefined"
    ? `${BASE_URL}${path}`
    : path
}

// --- Blog Store ---
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

// --- Video Store ---
export const videoStore = {
  async getAllVideos(): Promise<Video[]> {
    try {
      const response = await fetch(getApiUrl("/api/admin/videos"), {
        cache: "no-store",
      })
      if (response.ok) {
        const videos = await response.json()
        // Some APIs return { videos: [...] }, some just return [...]
        return Array.isArray(videos) ? videos : videos.videos || []
      }
    } catch (error) {
      console.warn("Failed to fetch videos:", error)
    }
    return []
  },

  async getVideoBySlug(slug: string): Promise<Video | null> {
    try {
      const videos = await this.getAllVideos()
      return (
        videos.find(
          (video: any) =>
            (video.slug === slug || video.id === slug) &&
            (video.status ? video.status === "published" : true)
        ) || null
      )
    } catch (error) {
      console.warn("Failed to fetch video:", error)
      return null
    }
  },
}

// --- Categories ---
import { defaultCategories } from "./data"

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
  return defaultCategories
}

// --- For legacy compatibility (if still used elsewhere) ---
export const getVideos = videoStore.getAllVideos
