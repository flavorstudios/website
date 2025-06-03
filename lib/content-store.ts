import { promises as fs } from "fs"
import path from "path"
import { categoryStore } from "./category-store"

const DATA_DIR = path.join(process.cwd(), "content-data")

export interface BlogPost { /* ...same as before... */ }
export interface Video { /* ...same as before... */ }
export interface PageContent { /* ...same as before... */ }
export interface Comment { /* ...same as before... */ }
export interface SiteStats { /* ...same as before... */ }

export const VALID_CATEGORIES = ["Episodes", "Shorts", "Behind the Scenes", "Tutorials"]
export const VALID_BLOG_CATEGORIES = VALID_CATEGORIES
export const VALID_WATCH_CATEGORIES = VALID_CATEGORIES

// --- Utility: Ensure directory exists ---
async function ensureDataDir() {
  try { await fs.access(DATA_DIR) }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }) }
}

// --- NEW: Ensure file exists (with fallback data) ---
async function ensureDataFile(filename: string, fallback: any) {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2))
  }
}

// --- Improved: Always auto-create files if missing on read ---
async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataFile(filename, [])
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
  // You can optionally pass an object fallback for special files (like stats.json)
  await ensureDataFile(filename, null)
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

// --- (Dynamic category loading, unchanged) ---
async function getValidBlogCategories(): Promise<string[]> {
  try {
    const categories = await categoryStore.getByType("blog")
    if (categories.length > 0) {
      return categories.filter((cat) => cat.isActive).map((cat) => cat.name)
    }
  } catch (error) {
    console.warn("Failed to load dynamic blog categories, using static fallback")
  }
  return VALID_BLOG_CATEGORIES
}

async function getValidVideoCategories(): Promise<string[]> {
  try {
    const categories = await categoryStore.getByType("video")
    if (categories.length > 0) {
      return categories.filter((cat) => cat.isActive).map((cat) => cat.name)
    }
  } catch (error) {
    console.warn("Failed to load dynamic video categories, using static fallback")
  }
  return VALID_WATCH_CATEGORIES
}

// Blog Store (unchanged except now guaranteed files exist)
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
    try { await categoryStore.updatePostCounts() } catch { /* ignore */ }
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
    try { await categoryStore.updatePostCounts() } catch { /* ignore */ }
    return posts[index]
  },
  async delete(id: string): Promise<boolean> {
    const posts = await this.getAllRaw()
    const filtered = posts.filter((p) => p.id !== id)
    if (filtered.length === posts.length) return false
    await writeJsonFile("blogs.json", filtered)
    try { await categoryStore.updatePostCounts() } catch { /* ignore */ }
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

// Video Store (same logic for videos.json)
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
    try { await categoryStore.updatePostCounts() } catch { /* ignore */ }
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
    try { await categoryStore.updatePostCounts() } catch { /* ignore */ }
    return videos[index]
  },
  async delete(id: string): Promise<boolean> {
    const videos = await this.getAllRaw()
    const filtered = videos.filter((v) => v.id !== id)
    if (filtered.length === videos.length) return false
    await writeJsonFile("videos.json", filtered)
    try { await categoryStore.updatePostCounts() } catch { /* ignore */ }
    return true
  },
}

// Page Content Store
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

// Site Stats Store
export const statsStore = {
  async get(): Promise<SiteStats> {
    // Auto-create stats.json with fallback object if missing
    await ensureDataFile("stats.json", {
      youtubeSubscribers: "500K+",
      originalEpisodes: "50+",
      totalViews: "2M+",
      yearsCreating: "5",
      lastUpdated: new Date().toISOString(),
    })
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

// Comment Store
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

// Backward compatibility
export async function initializeRealData() {
  return initializeCleanData()
}

// --- Master Initializer: Create ALL files if missing (no dummy content) ---
export async function initializeCleanData() {
  try {
    const { initializeDefaultCategories } = await import("./category-store")
    await initializeDefaultCategories()
  } catch (error) {
    console.warn("Failed to initialize dynamic categories, using static categories")
  }
  await Promise.all([
    ensureDataFile("blogs.json", []),
    ensureDataFile("videos.json", []),
    ensureDataFile("comments.json", []),
    ensureDataFile("pages.json", []),
    ensureDataFile("stats.json", {
      youtubeSubscribers: "500K+",
      originalEpisodes: "50+",
      totalViews: "2M+",
      yearsCreating: "5",
      lastUpdated: new Date().toISOString(),
    }),
  ])
}
