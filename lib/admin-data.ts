import { promises as fs } from "fs"
import path from "path"
import type { BlogPost } from "@/lib/types"

export type { BlogPost }

const DATA_DIR = path.join(process.cwd(), "data")

export interface Video {
  id: string
  title: string
  description: string
  embedUrl: string
  thumbnail: string
  category: string
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
  flagged?: boolean        // <-- ADDED for moderation support
}

export interface PageContent {
  id: string
  page: string
  section: string
  content: Record<string, unknown>
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
    const parsed: unknown = JSON.parse(data)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// --- Helper to fetch comment count for each post ---
async function getCommentCountByPost(): Promise<Record<string, number>> {
  const comments = await readJsonFile<Comment>("comments.json")
  const counts: Record<string, number> = {}
  for (const c of comments) {
    const current = counts[c.postId] ?? 0
    counts[c.postId] = current + 1
  }
  return counts
}

export const blogData = {
  async getAll(): Promise<BlogPost[]> {
    const posts = await readJsonFile<BlogPost>("blogs.json")
    const commentCounts = await getCommentCountByPost()
    // Always return array, and ensure categories[] present (for backward compatibility)
    return posts.map((post) => ({
      ...post,
      // If categories missing, fallback to [category]
      categories: Array.isArray(post.categories) && post.categories.length > 0 ? post.categories : [post.category],
      commentCount: commentCounts[post.id] ?? 0, // <-- Always attach commentCount
      shareCount: typeof post.shareCount === "number" ? post.shareCount : 0,
    }))
  },

  // Accepts either `category` (string) or `categories` (string[])
  async create(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "commentCount" | "shareCount">): Promise<BlogPost> {
    const posts = await this.getAll()
    const categoriesInput = Array.isArray(post.categories)
      ? post.categories.filter((value): value is string => typeof value === "string" && value.length > 0)
      : []
    const [firstCategory] = categoriesInput
    const mainCategory = firstCategory ?? post.category ?? ""
    const categories =
      categoriesInput.length > 0
        ? categoriesInput
        : post.category
          ? [post.category]
          : mainCategory
            ? [mainCategory]
            : []

    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      category: mainCategory,
      categories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentCount: 0,
      shareCount: 0,
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

    const existing = posts[index]
    if (!existing) {
      return null
    }

    let updatedCategories: string[] | undefined = Array.isArray(existing.categories)
      ? existing.categories
      : undefined
    let updatedCategory: string = existing.category

    // If categories provided in updates, use it
    if (Array.isArray(updates.categories) && updates.categories.length > 0) {
      const [firstUpdate] = updates.categories
      if (firstUpdate) {
        updatedCategories = updates.categories
        updatedCategory = firstUpdate
      }
    }
    // If only category provided, update both fields for consistency
    else if (typeof updates.category === "string" && updates.category) {
      updatedCategory = updates.category
      updatedCategories = [updates.category]
    }

    const nextPost: BlogPost = {
      ...existing,
      ...updates,
      category: updatedCategory,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    }
    posts[index] = nextPost
    await writeJsonFile("blogs.json", posts)
    return nextPost
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
    const existing = videos[index]
    if (!existing) {
      return null
    }
    const nextVideo: Video = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    }
    videos[index] = nextVideo
    await writeJsonFile("videos.json", videos)
    return nextVideo
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
    const existing = comments[index]
    if (!existing) {
      return null
    }
    const nextComment: Comment = { ...existing, status }
    comments[index] = nextComment
    await writeJsonFile("comments.json", comments)
    return nextComment
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

  async update(page: string, section: string, content: Record<string, unknown>): Promise<PageContent> {
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
