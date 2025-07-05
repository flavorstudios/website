// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, '../content-data/categories.json')
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // Merge blog and watch categories into one array with correct 'type'
  const categories = [
    ...jsonData.blog.map((cat: any) => ({ ...cat, type: 'BLOG' })),
    ...jsonData.watch.map((cat: any) => ({ ...cat, type: 'VIDEO' })),
  ]

  // Prisma model fields only
  const allowedFields = [
    "id", "name", "slug", "type", "description", "color", "icon", "order", "isActive",
    "metaTitle", "metaDescription", "canonicalUrl", "robots", "ogTitle", "ogDescription",
    "ogUrl", "ogType", "ogSiteName", "ogImages", "twitterCard", "twitterSite", "twitterTitle",
    "twitterDescription", "twitterImages", "tooltip", "accessibleLabel", "schema", "postCount"
  ]

  for (const cat of categories) {
    // Map title -> name, and only use allowed fields for upsert
    const mapped: any = { ...cat, name: cat.title }
    delete mapped.title

    // Remove any keys not in Prisma schema
    Object.keys(mapped).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete mapped[key]
      }
    })

    await prisma.category.upsert({
      where: { slug: mapped.slug },   // Use slug as unique key!
      update: mapped,
      create: mapped,
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
