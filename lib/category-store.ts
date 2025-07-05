// lib/category-store.ts

import { PrismaClient, CategoryType, Category as PrismaCategory } from "@prisma/client"

const prisma = new PrismaClient()

export type Category = PrismaCategory

export const categoryStore = {
  async getAll(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { order: "asc" } })
  },

  async getByType(type: "blog" | "video"): Promise<Category[]> {
    const enumType = type === "blog" ? CategoryType.BLOG : CategoryType.VIDEO
    return prisma.category.findMany({
      where: { type: enumType, isActive: true },
      orderBy: { order: "asc" },
    })
  },

  async getById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } })
  },

  async getBySlug(slug: string, type: "blog" | "video"): Promise<Category | null> {
    const enumType = type === "blog" ? CategoryType.BLOG : CategoryType.VIDEO
    return prisma.category.findUnique({
      where: { slug_type: { slug, type: enumType } },
    })
  },

  async create(category: Omit<Category, "id" | "createdAt" | "updatedAt" | "postCount">): Promise<Category> {
    // Prevent duplicate (slug, type)
    const slug = category.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    const enumType = category.type === "blog" ? CategoryType.BLOG : CategoryType.VIDEO

    const exists = await prisma.category.findUnique({
      where: { slug_type: { slug, type: enumType } },
    })
    if (exists) {
      throw new Error(`Category "${category.name}" already exists for ${category.type}`)
    }

    return prisma.category.create({
      data: {
        ...category,
        slug,
        type: enumType,
        postCount: 0,
      },
    })
  },

  async update(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category | null> {
    // If updating name, also update slug
    let data: any = { ...updates }
    if (updates.name) {
      data.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }
    try {
      return await prisma.category.update({
        where: { id },
        data,
      })
    } catch {
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.category.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  },

  // Update post counts for dashboard/statistics
  async updatePostCounts(): Promise<void> {
    // NOTE: You must implement blogStore/videoStore with Prisma for best results!
    // Example (pseudo):
    // const blogs = await prisma.blog.findMany()
    // const videos = await prisma.video.findMany()
    // ...then count posts per category, and update prisma.category accordingly
    // For now, this is a placeholder (safe to leave empty if not used yet)
    return
  },

  async reorder(categoryIds: string[]): Promise<void> {
    // Update order based on the provided array position
    await Promise.all(
      categoryIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { order: index },
        }),
      ),
    )
  },
}

// Initialize default categories if none exist (Prisma-only, no file logic)
export async function initializeDefaultCategories() {
  const count = await prisma.category.count()
  if (count === 0) {
    const defaultNames = ["Anime News", "Reviews", "Behind the Scenes", "Tutorials"]
    for (let i = 0; i < defaultNames.length; i++) {
      const base = {
        name: defaultNames[i],
        description: `Content related to ${defaultNames[i].toLowerCase()}`,
        color: `hsl(${(i * 90) % 360}, 70%, 50%)`,
        order: i,
        isActive: true,
      }
      // BLOG
      await prisma.category.create({
        data: {
          ...base,
          slug: base.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          type: CategoryType.BLOG,
          postCount: 0,
        },
      })
      // VIDEO
      await prisma.category.create({
        data: {
          ...base,
          slug: base.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          type: CategoryType.VIDEO,
          postCount: 0,
        },
      })
    }
    console.log("Default categories initialized in database.")
  }
}
