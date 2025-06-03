import { promises as fs } from "fs"
import path from "path"
// Uncomment below if you want bulletproof IDs
// import { nanoid } from "nanoid"

const DATA_DIR = path.join(process.cwd(), "data")

export interface BlogPost {
  id: string
  title: string
  category: string
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
  // Add these if you want to match global Video interface:
  // youtubeId?: string
  // status?: string
  // views?: number
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
  } catch (err) {
    console.error(`Error reading ${filename}:`, err)
    return []
  }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// --- Blog ---
export const blogData = {
  async getAll(): Promise<BlogPost[]> {
    return readJsonFile<BlogPost>("blogs.json")
  },

  async create(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<BlogPost> {
    const posts = await this.getAll()
    const newPost: BlogPost = {
      ...post,
      // id: nanoid(), // Use nanoid for unique IDs
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    posts.push(newPost)
    await writeJsonFile("blogs.json", posts)
    return newPost
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const posts = await this.getAll()
    const index = posts.findIndex((p) => p.id === id)
    if (index === -1) return null

    posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() }
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

// --- Videos ---
export const videoData = {
  async getAll(): Promise<Video[]> {
    return readJsonFile<Video>("videos.json")
  },

  async create(video: Omit<Video, "id" | "createdAt" | "updatedAt">): Promise<Video> {
    const videos = await this.getAll()
    const newVideo: Video = {
      ...video,
      // id: nanoid(),
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

// --- Comments ---
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

// --- Page Content ---
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
