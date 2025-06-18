// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Load your JSON
  const categoriesPath = path.join(__dirname, '../content-data/categories.json');
  const categoriesJson = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  // Merge blog and watch categories, annotate type
  const allCategories = [
    ...(categoriesJson.blog || []).map(c => ({ ...c, type: 'blog' })),
    ...(categoriesJson.watch || []).map(c => ({ ...c, type: 'video' })),
  ];

  for (const cat of allCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        title: cat.title,
        description: cat.description,
        menuDescription: cat.menuDescription || "",   // <-- NEW FIELD
        accessibleLabel: cat.accessibleLabel,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        canonicalUrl: cat.canonicalUrl,
        robots: cat.robots,
        ogTitle: cat.ogTitle,
        ogDescription: cat.ogDescription,
        ogUrl: cat.ogUrl,
        ogType: cat.ogType,
        ogSiteName: cat.ogSiteName,
        ogImages: cat.ogImages, // this is an array
        twitterCard: cat.twitterCard,
        twitterSite: cat.twitterSite,
        twitterTitle: cat.twitterTitle,
        twitterDescription: cat.twitterDescription,
        twitterImages: cat.twitterImages, // this is an array
        schema: cat.schema,
        type: cat.type,
        // postCount is left as-is (will be managed elsewhere)
      },
      create: {
        id: cat.id, // keep your UUIDs for consistency
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        menuDescription: cat.menuDescription || "",   // <-- NEW FIELD
        accessibleLabel: cat.accessibleLabel,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
        postCount: cat.postCount || 0,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        canonicalUrl: cat.canonicalUrl,
        robots: cat.robots,
        ogTitle: cat.ogTitle,
        ogDescription: cat.ogDescription,
        ogUrl: cat.ogUrl,
        ogType: cat.ogType,
        ogSiteName: cat.ogSiteName,
        ogImages: cat.ogImages,
        twitterCard: cat.twitterCard,
        twitterSite: cat.twitterSite,
        twitterTitle: cat.twitterTitle,
        twitterDescription: cat.twitterDescription,
        twitterImages: cat.twitterImages,
        schema: cat.schema,
        type: cat.type,
      }
    });
  }

  console.log('✅ Categories seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());