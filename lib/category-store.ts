import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "content-data")

export interface Category {
  id: string
  name: string
  slug: string
  type: "blog" | "video"
  description?: string
  color?: string
  icon?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  postCount: number
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    console.log("Creating data directory:", DATA_DIR)
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filePath, "utf-8")
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn(`Failed to read ${filename}, returning empty array:`, error)
    return []
  }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// Category Store - EXPORTED AS NAMED EXPORT
export const categoryStore = {
  async getAll(): Promise<Category[]> {
    const categories = await readJsonFile<Category>("categories.json")
    return categories
  },

  async getByType(type: "blog" | "video"): Promise<Category[]> {
    const categories = await this.getAll()
    return categories.filter((cat) => cat.type === type && cat.isActive).sort((a, b) => a.order - b.order)
  },

  async getById(id: string): Promise<Category | null> {
    const categories = await this.getAll()
    return categories.find((cat) => cat.id === id) || null
  },

  async getBySlug(slug: string, type: "blog" | "video"): Promise<Category | null> {
    const categories = await this.getAll()
    return categories.find((cat) => cat.slug === slug && cat.type === type) || null
  },

  async create(category: Omit<Category, "id" | "createdAt" | "updatedAt" | "postCount">): Promise<Category> {
    const categories = await this.getAll()

    // Check for duplicate names within the same type
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === category.name.toLowerCase() && cat.type === category.type,
    )
    if (existingCategory) {
      throw new Error(`Category "${category.name}" already exists for ${category.type}`)
    }

    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postCount: 0,
    }

    categories.push(newCategory)
    await writeJsonFile("categories.json", categories)
    return newCategory
  },

  async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = await this.getAll()
    const index = categories.findIndex((cat) => cat.id === id)
    if (index === -1) return null

    // Check for duplicate names if name is being updated
    if (updates.name) {
      const existingCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase() === updates.name!.toLowerCase() &&
          cat.type === categories[index].type &&
          cat.id !== id,
      )
      if (existingCategory) {
        throw new Error(`Category "${updates.name}" already exists`)
      }

      // Update slug if name changes
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJsonFile("categories.json", categories)
    return categories[index]
  },

  async delete(id: string): Promise<boolean> {
    const categories = await this.getAll()
    const category = categories.find((cat) => cat.id === id)
    if (!category) return false

    // Check if category is being used
    if (category.postCount > 0) {
      throw new Error(`Cannot delete category "${category.name}" because it has ${category.postCount} posts`)
    }

    const filtered = categories.filter((cat) => cat.id !== id)
    await writeJsonFile("categories.json", filtered)
    return true
  },

  async updatePostCounts(): Promise<void> {
    const categories = await this.getAll()
    const { blogStore, videoStore } = await import("./content-store")

    const [blogs, videos] = await Promise.all([
      blogStore.getAllRaw().catch(() => []),
      videoStore.getAllRaw().catch(() => []),
    ])

    // Count posts for each category
    for (const category of categories) {
      if (category.type === "blog") {
        category.postCount = blogs.filter((post) => post.category === category.name).length
      } else {
        category.postCount = videos.filter((video) => video.category === category.name).length
      }
    }

    await writeJsonFile("categories.json", categories)
  },

  async reorder(categoryIds: string[]): Promise<void> {
    const categories = await this.getAll()

    // Update order based on array position
    categoryIds.forEach((id, index) => {
      const category = categories.find((cat) => cat.id === id)
      if (category) {
        category.order = index
        category.updatedAt = new Date().toISOString()
      }
    })

    await writeJsonFile("categories.json", categories)
  },
}

// Initialize default categories - EXACTLY matching your screenshot: Episodes, Shorts, Behind the Scenes, Tutorials
export async function initializeDefaultCategories() {
  try {
    await ensureDataDir()
    const categories = await categoryStore.getAll()

    if (categories.length === 0) {
      console.log("Initializing default categories...")
      // EXACT 4 CATEGORIES from your screenshot
      const exactCategories = ["Anime News", "Reviews", "Behind the Scenes", "Tutorials"]

      // Create blog categories
      for (let i = 0; i < exactCategories.length; i++) {
        try {
          await categoryStore.create({
            name: exactCategories[i],
            type: "blog",
            description: `Blog content related to ${exactCategories[i].toLowerCase()}`,
            color: `hsl(${(i * 90) % 360}, 70%, 50%)`,
            order: i,
            isActive: true,
          })
        } catch (error) {
          console.warn(`Failed to create blog category ${exactCategories[i]}:`, error)
        }
      }

      // Create video categories with same names
      for (let i = 0; i < exactCategories.length; i++) {
        try {
          await categoryStore.create({
            name: exactCategories[i],
            type: "video",
            description: `Video content related to ${exactCategories[i].toLowerCase()}`,
            color: `hsl(${(i * 90) % 360}, 70%, 50%)`,
            order: i,
            isActive: true,
          })
        } catch (error) {
          console.warn(`Failed to create video category ${exactCategories[i]}:`, error)
        }
      }

      console.log("Default categories initialized successfully")
    }
  } catch (error) {
    console.error("Failed to initialize default categories:", error)
  }
}
