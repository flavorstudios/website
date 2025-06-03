// /lib/data.ts

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
  updatedAt?: string
  draft?: boolean
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

export const defaultCategories: Category[] = [
  { id: "1", name: "All", slug: "all", description: "All content" },
  { id: "2", name: "Anime News", slug: "anime-news", description: "Latest anime news and updates" },
  { id: "3", name: "Reviews", slug: "reviews", description: "Anime and manga reviews" },
  { id: "4", name: "Behind the Scenes", slug: "behind-the-scenes", description: "Behind the scenes content" },
  { id: "5", name: "Tutorials", slug: "tutorials", description: "How-to guides and tutorials" },
]
