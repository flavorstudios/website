// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const categoriesData = require('../content-data/categories.json')

const prisma = new PrismaClient()

async function main() {
  const allCategories = [
    ...categoriesData.blog.map(cat => ({ ...cat, type: 'blog' })),
    ...categoriesData.watch.map(cat => ({ ...cat, type: 'watch' })),
  ]

  for (const cat of allCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    })
  }

  console.log('✅ Categories seeded!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())