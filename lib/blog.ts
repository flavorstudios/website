export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string           // Main/legacy category
  categories?: string[]      // New: multiple categories, optional
  tags: string[]
  publishedAt: string
  author: string
  featured: boolean
  imageUrl?: string
  commentCount?: number      // <-- Always present, default 0 if missing
  shareCount?: number        // <-- Always present, default 0 if missing
}

export const blogStore = {
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const response = await fetch("/api/blogs", {
        cache: "no-store",
      })

      if (response.ok) {
        const posts = await response.json()
        // Always ensure categories[] exists (for old posts)
        // and commentCount/shareCount are present
        return (posts || []).map((post: BlogPost) => ({
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

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const posts = await this.getAllPosts()
      return posts.find((post) => post.slug === slug) || null
    } catch (error) {
      console.warn("Failed to fetch blog post:", error)
      return null
    }
  },

  async getPostsByCategory(category: string): Promise<BlogPost[]> {
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
