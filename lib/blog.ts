import type { PublicBlogDetail, PublicBlogSummary } from "@/lib/types"
import { canonicalBaseUrl } from "@/lib/base-url"

function buildApiUrl(path: string): string {
  const base = canonicalBaseUrl()

  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}

export async function getBlogPost(key: string): Promise<PublicBlogDetail | null> {
  try {
    const encodedKey = encodeURIComponent(key)
    const response = await fetch(buildApiUrl(`/api/blogs/${encodedKey}`), {
      cache: "no-store",
      next: { revalidate: 300 },
    })

    if (response.status === 404) {
      // Missing posts are represented as null so pages can trigger notFound()
      return null
    }

    if (response.ok) {
      return (await response.json()) as PublicBlogDetail
    }

    const body = await response.text()
    console.warn(
      `Failed to fetch blog post: ${response.status} ${response.statusText} - ${body}`,
    )
  } catch (error) {
    console.warn("Failed to fetch blog post:", error)
  }

  return null
}


export const blogStore = {
  async getAllPosts(): Promise<PublicBlogSummary[]> {
    try {
      const response = await fetch(buildApiUrl(`/api/blogs`), {
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
