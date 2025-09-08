import type { PublicBlogDetail, PublicBlogSummary } from "@/lib/types"
import { serverEnv } from "@/env/server"
import { SITE_URL } from "@/lib/constants"

const baseUrl = serverEnv.NEXT_PUBLIC_BASE_URL || SITE_URL

export async function getBlogPost(slug: string): Promise<PublicBlogDetail | null> {
  const encodedSlug = encodeURIComponent(slug)
  const response = await fetch(`${baseUrl}/api/blogs/${encodedSlug}`, {
    next: { revalidate: 3600 },
  })

  if (response.ok) {
    return (await response.json()) as PublicBlogDetail
  }

  if (response.status === 404) {
    return null
  }

  const body = await response.text()
  throw new Error(`Failed to fetch blog post: ${response.status} ${response.statusText} - ${body}`)
}


export const blogStore = {
  async getAllPosts(): Promise<PublicBlogSummary[]> {
    try {
      const response = await fetch(`${baseUrl}/api/blogs`, {
        cache: "no-store",
      })

      if (response.ok) {
        const posts = await response.json()
        // Always ensure categories[] exists (for old posts)
        // and commentCount/shareCount are present
        return (posts || []).map((post: PublicBlogSummary) => ({
          ...post,
          categories: Array.isArray(post.categories) && post.categories.length > 0
            ? post.categories
            : [post.category],
          commentCount: typeof post.commentCount === "number" ? post.commentCount : 0,
          shareCount: typeof post.shareCount === "number" ? post.shareCount : 0,
        }))
      }
    } catch (error) {
      console.warn("Failed to fetch blog posts:", error)
    }

    return []
  },

  async getPostBySlug(slug: string): Promise<PublicBlogSummary | null> {
    try {
      const posts = await this.getAllPosts()
      return posts.find((post) => post.slug === slug) || null
    } catch (error) {
      console.warn("Failed to fetch blog post:", error)
      return null
    }
  },

  async getPostsByCategory(category: string): Promise<PublicBlogSummary[]> {
    try {
      const posts = await this.getAllPosts()
      if (category === "all") return posts

      // Check both main category and all categories (array)
      return posts.filter((post) =>
        post.category === category ||
        (Array.isArray(post.categories) && post.categories.includes(category))
      )
    } catch (error) {
      console.warn("Failed to fetch blog posts by category:", error)
      return []
    }
  },

  async getFeaturedPosts(): Promise<PublicBlogSummary[]> {
    try {
      const posts = await this.getAllPosts()
      return posts.filter((post) => post.featured)
    } catch (error) {
      console.warn("Failed to fetch featured blog posts:", error)
      return []
    }
  },
}
