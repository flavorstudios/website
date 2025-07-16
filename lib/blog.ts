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

export const blogStore = {
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const response = await fetch("/api/blogs", { // <-- updated endpoint as per Codex
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
