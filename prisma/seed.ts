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
  for (const cat of categories) {
    await prisma.category.upsert({
      // KEY: Compound unique needs this exact shape!
      where: { slug_type: { slug: cat.slug, type: cat.type } },
      update: cat,
      create: cat,
    })
  }

  console.log('✅ Categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
