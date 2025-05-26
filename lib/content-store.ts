import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "content-data")

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

// Blog Store
export const blogStore = {
  async getAll(): Promise<BlogPost[]> {
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

    posts[index] = {
      ...posts[index],
      ...updates,
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

  async incrementViews(slug: string): Promise<void> {
    const posts = await this.getAll()
    const index = posts.findIndex((p) => p.slug === slug)
    if (index !== -1) {
      posts[index].views += 1
      await writeJsonFile("blogs.json", posts)
    }
  },
}

// Video Store
export const videoStore = {
  async getAll(): Promise<Video[]> {
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

    videos[index] = {
      ...videos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
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

// Initialize with real data from your site
export async function initializeRealData() {
  const blogs = await blogStore.getAll()
  const videos = await videoStore.getAll()

  if (blogs.length === 0) {
    // Initialize with real blog posts
    await blogStore.create({
      title: "New Anime Season Preview: What to Watch This Fall",
      slug: "anime-season-preview-fall-2024",
      content:
        "Discover the most anticipated anime releases coming this season, from action-packed adventures to heartwarming slice-of-life stories. Our team has curated the best upcoming shows that will define this fall season.",
      excerpt:
        "Discover the most anticipated anime releases coming this season, from action-packed adventures to heartwarming slice-of-life stories.",
      status: "published",
      category: "News",
      tags: ["anime", "season preview", "fall 2024", "recommendations"],
      featuredImage: "/placeholder.svg?height=400&width=600&query=anime season preview fall",
      seoTitle: "Fall 2024 Anime Season Preview - Best Shows to Watch",
      seoDescription:
        "Complete guide to the best anime shows premiering in Fall 2024. Get recommendations from Flavor Studios.",
      author: "Flavor Studios Team",
      publishedAt: new Date().toISOString(),
      readTime: "5 min read",
    })

    await blogStore.create({
      title: "Behind the Scenes: Creating Our Latest Original Series",
      slug: "behind-scenes-latest-original-series",
      content:
        "Take an exclusive look at our creative process and the making of our newest project, from initial concept to final animation. Learn about the challenges and breakthroughs in our latest production.",
      excerpt:
        "Take a look at our creative process and the making of our newest project, from initial concept to final animation.",
      status: "published",
      category: "Studio Updates",
      tags: ["behind the scenes", "production", "original series", "animation"],
      featuredImage: "/placeholder.svg?height=400&width=600&query=anime production behind scenes",
      seoTitle: "Behind the Scenes: How We Create Original Anime",
      seoDescription: "Exclusive behind-the-scenes look at Flavor Studios' animation production process.",
      author: "Flavor Studios Team",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      readTime: "8 min read",
    })
  }

  if (videos.length === 0) {
    // Initialize with real videos
    await videoStore.create({
      title: "Mystic Chronicles Episode 1: The Beginning",
      description:
        "The first episode of our original anime series Mystic Chronicles. Follow young mages discovering their powers in a world where magic and technology collide.",
      youtubeId: "dQw4w9WgXcQ", // Replace with actual video IDs
      thumbnail: "/placeholder.svg?height=300&width=400&query=mystic anime series magic",
      duration: "24:30",
      category: "Original Series",
      tags: ["mystic chronicles", "episode 1", "original anime", "magic"],
      status: "published",
      publishedAt: new Date().toISOString(),
      featured: true,
    })

    await videoStore.create({
      title: "Character Design Process: From Sketch to Animation",
      description:
        "Learn our complete character design workflow, from initial sketches to final animated characters in Blender.",
      youtubeId: "dQw4w9WgXcQ", // Replace with actual video IDs
      thumbnail: "/placeholder.svg?height=300&width=400&query=anime character design process",
      duration: "15:45",
      category: "Tutorial",
      tags: ["character design", "tutorial", "blender", "animation"],
      status: "published",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      featured: true,
    })
  }
}
