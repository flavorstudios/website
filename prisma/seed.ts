// prisma/seed.ts

import { PrismaClient, CategoryType } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  // BLOG categories
  {
    slug: "anime-news",
    name: "Anime News",
    type: CategoryType.BLOG,
    description: "Latest anime news and updates",
    isActive: true,
    order: 1,
  },
  {
    slug: "reviews",
    name: "Reviews",
    type: CategoryType.BLOG,
    description: "Anime and manga reviews",
    isActive: true,
    order: 2,
  },
  {
    slug: "behind-the-scenes",
    name: "Behind the Scenes",
    type: CategoryType.BLOG,
    description: "Behind the scenes content",
    isActive: true,
    order: 3,
  },
  {
    slug: "tutorials",
    name: "Tutorials",
    type: CategoryType.BLOG,
    description: "How-to guides and tutorials",
    isActive: true,
    order: 4,
  },
  // VIDEO categories
  {
    slug: "anime-news",
    name: "Anime News",
    type: CategoryType.VIDEO,
    description: "Latest anime news and updates",
    isActive: true,
    order: 1,
  },
  {
    slug: "reviews",
    name: "Reviews",
    type: CategoryType.VIDEO,
    description: "Anime and manga reviews",
    isActive: true,
    order: 2,
  },
  {
    slug: "behind-the-scenes",
    name: "Behind the Scenes",
    type: CategoryType.VIDEO,
    description: "Behind the scenes content",
    isActive: true,
    order: 3,
  },
  {
    slug: "tutorials",
    name: "Tutorials",
    type: CategoryType.VIDEO,
    description: "How-to guides and tutorials",
    isActive: true,
    order: 4,
  },
]

async function main() {
  try {
    // Check if categories already exist (by slug+type, should be 8)
    const total = await prisma.category.count()
    if (total >= categories.length) {
      console.log(`ℹ️  Skipping seeding: Found ${total} categories (no action needed).`)
      return
    }

    let seeded = 0
    for (const cat of categories) {
      try {
        await prisma.category.upsert({
          where: { slug_type: { slug: cat.slug, type: cat.type } }, // Compound unique!
          update: cat,
          create: cat,
        })
        seeded++
      } catch (err) {
        console.error(`❌ Failed to upsert category [${cat.slug} / ${cat.type}]:`, err)
      }
    }

    console.log(`✅ Categories seeded successfully! (${seeded} added or updated)`)
  } catch (error) {
    console.error("❌ Seed script error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
