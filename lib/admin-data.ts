import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

export interface BlogPost {
  id: string
  title: string
  category: string             // Main category (backward compatible)
  categories?: string[]        // New: multiple categories (optional)
  metaTitle: string
  metaDescription: string
  thumbnail: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Video {
  id: string
  title: string
  description: string
  embedUrl: string
  thumbnail: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  author: string
  email: string
  content: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface PageContent {
  id: string
  page: string
  section: string
  content: Record<string, any>
  updatedAt: string
}

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

export const blogData = {
  async getAll(): Promise<BlogPost[]> {
    const posts = await readJsonFile<BlogPost>("blogs.json")
    // Always return array, and ensure categories[] present (for backward compatibility)
    return posts.map((post) => ({
      ...post,
      // If categories missing, fallback to [category]
      categories: post.categories && post.categories.length > 0 ? post.categories : [post.category],
    }))
  },

  // Accepts either `category` (string) or `categories` (string[])
  async create(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<BlogPost> {
    const posts = await this.getAll()
    const mainCategory =
      Array.isArray(post.categories) && post.categories.length > 0
        ? post.categories[0]
        : post.category
    const categories =
      Array.isArray(post.categories) && post.categories.length > 0
        ? post.categories
        : post.category
          ? [post.category]
          : []

    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      category: mainCategory,
      categories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    posts.push(newPost)
    await writeJsonFile("blogs.json", posts)
    return newPost
  },

  // Accepts updates for category/categories. Always keeps both fields in sync.
  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const posts = await this.getAll()
    const index = posts.findIndex((p) => p.id === id)
    if (index === -1) return null

    let updatedCategories: string[] | undefined = posts[index].categories
    let updatedCategory: string = posts[index].category

    // If categories provided in updates, use it
    if (updates.categories && Array.isArray(updates.categories) && updates.categories.length > 0) {
      updatedCategories = updates.categories
      updatedCategory = updates.categories[0]
    }
    // If only category provided, update both fields for consistency
    else if (typeof updates.category === "string" && updates.category) {
      updatedCategory = updates.category
      updatedCategories = [updates.category]
    }

    posts[index] = {
      ...posts[index],
      ...updates,
      category: updatedCategory,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile("blogs.json", posts)
    return posts[index]
  },

  async delete(id: string): Promise<boolean> {
    const posts = await this.getAll()
    const filtered = posts.filter((p) => p.id !== id)
    if (filtered.length === posts.length) return false
    await writeJsonFile("blogs.json", filtered)
    return true
  },
}

export const videoData = {
  async getAll(): Promise<Video[]> {
    return readJsonFile<Video>("videos.json")
  },

  async create(video: Omit<Video, "id" | "createdAt" | "updatedAt">): Promise<Video> {
    const videos = await this.getAll()
    const newVideo: Video = {
      ...video,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    videos.push(newVideo)
    await writeJsonFile("videos.json", videos)
    return newVideo
  },

  async update(id: string, updates: Partial<Video>): Promise<Video | null> {
    const videos = await this.getAll()
    const index = videos.findIndex((v) => v.id === id)
    if (index === -1) return null
    videos[index] = { ...videos[index], ...updates, updatedAt: new Date().toISOString() }
    await writeJsonFile("videos.json", videos)
    return videos[index]
  },

  async delete(id: string): Promise<boolean> {
    const videos = await this.getAll()
    const filtered = videos.filter((v) => v.id !== id)
    if (filtered.length === videos.length) return false
    await writeJsonFile("videos.json", filtered)
    return true
  },
}

export const commentData = {
  async getAll(): Promise<Comment[]> {
    return readJsonFile<Comment>("comments.json")
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

export const pageContentData = {
  async getAll(): Promise<PageContent[]> {
    return readJsonFile<PageContent>("page-content.json")
  },

  async update(page: string, section: string, content: Record<string, any>): Promise<PageContent> {
    const contents = await this.getAll()
    const index = contents.findIndex((c) => c.page === page && c.section === section)
    const updatedContent: PageContent = {
      id: `${page}-${section}`,
      page,
      section,
      content,
      updatedAt: new Date().toISOString(),
    }

    if (index === -1) {
      contents.push(updatedContent)
    } else {
      contents[index] = updatedContent
    }
    await writeJsonFile("page-content.json", contents)
    return updatedContent
  },
}
