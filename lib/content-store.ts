import { PrismaClient, CategoryType } from "@prisma/client"
import { promises as fs } from "fs"
import path from "path"

const prisma = new PrismaClient()
const DATA_DIR = path.join(process.cwd(), "content-data")

// --- TYPES ---

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: "draft" | "published" | "scheduled"
  category: string
  tags: string[]
  featuredImage: string
  seoTitle: string
  seoDescription: string
  author: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  views: number
  readTime: string
}

export interface Video {
  id: string
  title: string
  description: string
  youtubeId: string
  thumbnail: string
  duration: string
  category: string
  tags: string[]
  status: "draft" | "published"
  publishedAt: string
  createdAt: string
  updatedAt: string
  views: number
  featured: boolean
  slug?: string
}

export interface PageContent {
  id: string
  page: string
  section: string
  content: Record<string, any>
  updatedAt: string
  updatedBy: string
}

export interface Comment {
  id: string
  postId: string
  postType: "blog" | "video"
  author: string
  email: string
  website?: string
  content: string
  status: "pending" | "approved" | "spam" | "trash"
  parentId?: string
  createdAt: string
  ip: string
  userAgent: string
}

export interface SiteStats {
  youtubeSubscribers: string
  originalEpisodes: string
  totalViews: string
  yearsCreating: string
  lastUpdated: string
}

// --- DATA DIR HELPERS ---

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

async function readSingleJsonFile<T>(filename: string): Promise<T | null> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function writeSingleJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// --- CATEGORY HELPERS (PRISMA ONLY, NO HARDCODED CATEGORIES) ---

async function getValidBlogCategories(): Promise<string[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { type: CategoryType.BLOG, isActive: true },
      select: { name: true },
      orderBy: { order: "asc" },
    })
    return categories.map((cat) => cat.name)
  } catch (error) {
    console.warn("Failed to load blog categories from Prisma:", error)
    return []
  }
}

async function getValidVideoCategories(): Promise<string[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { type: CategoryType.VIDEO, isActive: true },
      select: { name: true },
      orderBy: { order: "asc" },
    })
    return categories.map((cat) => cat.name)
  } catch (error) {
    console.warn("Failed to load video categories from Prisma:", error)
    return []
  }
}

// --- BLOG STORE ---

export const blogStore = {
  async getAll(): Promise<BlogPost[]> {
    const posts = await readJsonFile<BlogPost>("blogs.json")
    const validCategories = await getValidBlogCategories()
    return posts.filter((post) => validCategories.includes(post.category))
  },

  async getAllRaw(): Promise<BlogPost[]> {
    return readJsonFile<BlogPost>("blogs.json")
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getAll()
    return posts.find((p) => p.slug === slug && p.status === "published") || null
  },

  async getPublished(): Promise<BlogPost[]> {
    const posts = await this.getAll()
    return posts
      .filter((p) => p.status === "published")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  },

  async getByCategory(category: string): Promise<BlogPost[]> {
    const validCategories = await getValidBlogCategories()
    if (!validCategories.includes(category)) return []
    const posts = await this.getPublished()
    return posts.filter((post) => post.category === category)
  },

  async create(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "views">): Promise<BlogPost> {
    const validCategories = await getValidBlogCategories()
    if (!validCategories.includes(post.category)) {
      throw new Error(`Invalid blog category: ${post.category}. Valid categories: ${validCategories.join(", ")}`)
    }
    const posts = await this.getAllRaw()
    const newPost: BlogPost = {
      ...post,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    }
    posts.unshift(newPost)
    await writeJsonFile("blogs.json", posts)
    return newPost
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    if (updates.category) {
      const validCategories = await getValidBlogCategories()
      if (!validCategories.includes(updates.category)) {
        throw new Error(`Invalid blog category: ${updates.category}. Valid categories: ${validCategories.join(", ")}`)
      }
    }
    const posts = await this.getAllRaw()
    const index = posts.findIndex((p) => p.id === id)
    if (index === -1) return null
    posts[index] = {
      ...posts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile("blogs.json", posts)
    return posts[index]
  },

  async delete(id: string): Promise<boolean> {
    const posts = await this.getAllRaw()
    const filtered = posts.filter((p) => p.id !== id)
    if (filtered.length === posts.length) return false
    await writeJsonFile("blogs.json", filtered)
    return true
  },

  async incrementViews(slug: string): Promise<void> {
    const posts = await this.getAllRaw()
    const index = posts.findIndex((p) => p.slug === slug)
    if (index !== -1) {
      posts[index].views += 1
      await writeJsonFile("blogs.json", posts)
    }
  },
}

// --- VIDEO STORE ---

export const videoStore = {
  async getAll(): Promise<Video[]> {
    const videos = await readJsonFile<Video>("videos.json")
    const validCategories = await getValidVideoCategories()
    return videos.filter((video) => validCategories.includes(video.category))
  },

  async getAllRaw(): Promise<Video[]> {
    return readJsonFile<Video>("videos.json")
  },

  async getPublished(): Promise<Video[]> {
    const videos = await this.getAll()
    return videos
      .filter((v) => v.status === "published")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  },

  async getFeatured(): Promise<Video[]> {
    const videos = await this.getPublished()
    return videos.filter((v) => v.featured)
  },

  async getByCategory(category: string): Promise<Video[]> {
    const validCategories = await getValidVideoCategories()
    if (!validCategories.includes(category)) return []
    const videos = await this.getPublished()
    return videos.filter((video) => video.category === category)
  },

  async create(video: Omit<Video, "id" | "createdAt" | "updatedAt" | "views">): Promise<Video> {
    const validCategories = await getValidVideoCategories()
    if (!validCategories.includes(video.category)) {
      throw new Error(`Invalid video category: ${video.category}. Valid categories: ${validCategories.join(", ")}`)
    }
    const videos = await this.getAllRaw()
    const slug = video.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    const newVideo: Video = {
      ...video,
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    }
    videos.unshift(newVideo)
    await writeJsonFile("videos.json", videos)
    return newVideo
  },

  async update(id: string, updates: Partial<Video>): Promise<Video | null> {
    if (updates.category) {
      const validCategories = await getValidVideoCategories()
      if (!validCategories.includes(updates.category)) {
        throw new Error(`Invalid video category: ${updates.category}. Valid categories: ${validCategories.join(", ")}`)
      }
    }
    const videos = await this.getAllRaw()
    const index = videos.findIndex((v) => v.id === id)
    if (index === -1) return null
    videos[index] = {
      ...videos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile("videos.json", videos)
    return videos[index]
  },

  async delete(id: string): Promise<boolean> {
    const videos = await this.getAllRaw()
    const filtered = videos.filter((v) => v.id !== id)
    if (filtered.length === videos.length) return false
    await writeJsonFile("videos.json", filtered)
    return true
  },
}

// --- PAGE CONTENT STORE ---

export const pageStore = {
  async getAll(): Promise<PageContent[]> {
    return readJsonFile<PageContent>("pages.json")
  },

  async getPageContent(page: string, section: string): Promise<Record<string, any>> {
    const pages = await this.getAll()
    const content = pages.find((p) => p.page === page && p.section === section)
    return content?.content || {}
  },

  async update(page: string, section: string, content: Record<string, any>, updatedBy: string): Promise<PageContent> {
    const pages = await this.getAll()
    const index = pages.findIndex((p) => p.page === page && p.section === section)
    const updatedPage: PageContent = {
      id: `${page}_${section}`,
      page,
      section,
      content,
      updatedAt: new Date().toISOString(),
      updatedBy,
    }
    if (index === -1) {
      pages.push(updatedPage)
    } else {
      pages[index] = updatedPage
    }
    await writeJsonFile("pages.json", pages)
    return updatedPage
  },
}

// --- SITE STATS STORE ---

export const statsStore = {
  async get(): Promise<SiteStats> {
    const stats = await readSingleJsonFile<SiteStats>("stats.json")
    return (
      stats || {
        youtubeSubscribers: "500K+",
        originalEpisodes: "50+",
        totalViews: "2M+",
        yearsCreating: "5",
        lastUpdated: new Date().toISOString(),
      }
    )
  },

  async update(stats: Partial<SiteStats>): Promise<SiteStats> {
    const current = await this.get()
    const updated = {
      ...current,
      ...stats,
      lastUpdated: new Date().toISOString(),
    }
    await writeSingleJsonFile("stats.json", updated)
    return updated
  },
}

// --- COMMENT STORE ---

export const commentStore = {
  async getAll(): Promise<Comment[]> {
    return readJsonFile<Comment>("comments.json")
  },

  async getByPost(postId: string, postType: "blog" | "video"): Promise<Comment[]> {
    const comments = await this.getAll()
    return comments.filter((c) => c.postId === postId && c.postType === postType && c.status === "approved")
  },

  async create(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const comments = await this.getAll()
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    comments.unshift(newComment)
    await writeJsonFile("comments.json", comments)
    return newComment
  },

  async updateStatus(id: string, status: Comment["status"]): Promise<Comment | null> {
    const comments = await this.getAll()
    const index = comments.findIndex((c) => c.id === id)
    if (index === -1) return null
    comments[index].status = status
    await writeJsonFile("comments.json", comments)
    return comments[index]
  },

  async delete(id: string): Promise<boolean> {
    const comments = await this.getAll()
    const filtered = comments.filter((c) => c.id !== id)
    if (filtered.length === comments.length) return false
    await writeJsonFile("comments.json", filtered)
    return true
  },
}

// --- DATA INITIALIZER ---

export async function initializeRealData() {
  return initializeCleanData()
}

export async function initializeCleanData() {
  // No longer initializes categories from a file or constant!
  // Seed via Prisma, only for legacy empty data:
  const blogs = await blogStore.getAll()
  const videos = await videoStore.getAll()
  if (blogs.length === 0 && videos.length === 0) {
    await writeJsonFile("blogs.json", [])
    await writeJsonFile("videos.json", [])
    await writeJsonFile("comments.json", [])
    await writeJsonFile("pages.json", [])
    await statsStore.update({
      youtubeSubscribers: "500K+",
      originalEpisodes: "50+",
      totalViews: "2M+",
      yearsCreating: "5",
    })
  }
}
