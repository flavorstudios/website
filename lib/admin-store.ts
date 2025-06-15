import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "admin-data")

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

export interface Category {
  id: string
  type: "blog" | "video"
  slug: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface PageContent {
  id: string
  page: string
  section: string
  content: Record<string, any>
  updatedAt: string
  updatedBy: string
}

export interface SystemStats {
  totalPosts: number
  totalVideos: number
  totalComments: number
  pendingComments: number
  totalViews: number
  lastBackup: string
  storageUsed: string
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

// Blog management
export const blogStore = {
  async getAll(): Promise<BlogPost[]> {
    return readJsonFile<BlogPost>("blogs.json")
  },
  async getById(id: string): Promise<BlogPost | null> {
    const posts = await this.getAll()
    return posts.find((p) => p.id === id) || null
  },
  async create(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "views">): Promise<BlogPost> {
    const posts = await this.getAll()
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

// Video management
export const videoStore = {
  async getAll(): Promise<Video[]> {
    return readJsonFile<Video>("videos.json")
  },
  async create(video: Omit<Video, "id" | "createdAt" | "updatedAt" | "views">): Promise<Video> {
    const videos = await this.getAll()
    const newVideo: Video = {
      ...video,
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    }
    videos.unshift(newVideo)
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

// Comment management
export const commentStore = {
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

// Page content
export const pageStore = {
  async getAll(): Promise<PageContent[]> {
    return readJsonFile<PageContent>("pages.json")
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
    if (index === -1) pages.push(updatedPage)
    else pages[index] = updatedPage
    await writeJsonFile("pages.json", pages)
    return updatedPage
  },
}

// Category store
export const categoryStore = {
  async getAll(): Promise<Category[]> {
    return readJsonFile<Category>("categories.json")
  },
  async getBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getAll()
    return categories.find((c) => c.slug === slug) || null
  },
  async create(input: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    const categories = await this.getAll()
    const newCategory: Category = {
      ...input,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    categories.unshift(newCategory)
    await writeJsonFile("categories.json", categories)
    return newCategory
  },
  async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = await this.getAll()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) return null
    categories[index] = { ...categories[index], ...updates, updatedAt: new Date().toISOString() }
    await writeJsonFile("categories.json", categories)
    return categories[index]
  },
  async delete(id: string): Promise<boolean> {
    const categories = await this.getAll()
    const filtered = categories.filter((c) => c.id !== id)
    if (filtered.length === categories.length) return false
    await writeJsonFile("categories.json", filtered)
    return true
  },
}

// System stats
export const systemStore = {
  async getStats(): Promise<SystemStats> {
    const [blogs, videos, comments] = await Promise.all([
      blogStore.getAll(),
      videoStore.getAll(),
      commentStore.getAll(),
    ])
    return {
      totalPosts: blogs.length,
      totalVideos: videos.length,
      totalComments: comments.length,
      pendingComments: comments.filter((c) => c.status === "pending").length,
      totalViews:
        blogs.reduce((sum, post) => sum + post.views, 0) +
        videos.reduce((sum, video) => sum + video.views, 0),
      lastBackup: "Never",
      storageUsed: "2.4 MB",
    }
  },
}

// ✅ Sample Data Initialization
export async function initializeSampleData() {
  await writeJsonFile("categories.json", [
    {
      id: "cat_1",
      type: "blog",
      slug: "anime-news",
      name: "Anime News",
      description: "Latest Anime News, Updates & Releases",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cat_2",
      type: "video",
      slug: "original-anime",
      name: "Original Anime",
      description: "Watch our original anime creations",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])
}

// ✅ Constants (Optional)
export const VALID_BLOG_CATEGORIES = ["anime-news", "reviews", "guides", "features", "community"]
export const VALID_WATCH_CATEGORIES = ["original-anime", "trailers", "behind-the-scenes"]
