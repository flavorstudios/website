// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Utility to safely access nested properties
function safeGet(obj, path, fallback = null) {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), obj);
}

async function main() {
  // Load your JSON
  const categoriesPath = path.join(__dirname, '../content-data/categories.json');
  const categoriesJson = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  // Combine blog and watch categories, annotate type
  const allCategories = [
    ...(categoriesJson.blog || []).map(c => ({ ...c, type: 'blog' })),
    ...(categoriesJson.watch || []).map(c => ({ ...c, type: 'video' })), // use "video" to match your schema
  ];

  for (const cat of allCategories) {
    // Prepare flat object to match Prisma schema
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        title: cat.title,
        description: safeGet(cat, ['meta', 'description'], ''),
        canonicalUrl: safeGet(cat, ['meta', 'canonicalUrl'], ''),
        robots: safeGet(cat, ['meta', 'robots'], ''),
        ogTitle: safeGet(cat, ['openGraph', 'title'], ''),
        ogDescription: safeGet(cat, ['openGraph', 'description'], ''),
        ogUrl: safeGet(cat, ['openGraph', 'url'], ''),
        ogType: safeGet(cat, ['openGraph', 'type'], ''),
        ogImage: safeGet(cat, ['openGraph', 'images', 0, 'url'], ''),
        ogImageWidth: safeGet(cat, ['openGraph', 'images', 0, 'width'], 1200),
        ogImageHeight: safeGet(cat, ['openGraph', 'images', 0, 'height'], 630),
        twitterTitle: safeGet(cat, ['twitter', 'title'], ''),
        twitterDescription: safeGet(cat, ['twitter', 'description'], ''),
        twitterImage: safeGet(cat, ['twitter', 'images', 0], ''),
        schema: cat.schema || {},
        icon: cat.icon || '',
        accessibleLabel: cat.accessibleLabel || '',
        type: cat.type,
        // Don't touch postCount on update, let logic handle this elsewhere
      },
      create: {
        slug: cat.slug,
        title: cat.title,
        description: safeGet(cat, ['meta', 'description'], ''),
        canonicalUrl: safeGet(cat, ['meta', 'canonicalUrl'], ''),
        robots: safeGet(cat, ['meta', 'robots'], ''),
        ogTitle: safeGet(cat, ['openGraph', 'title'], ''),
        ogDescription: safeGet(cat, ['openGraph', 'description'], ''),
        ogUrl: safeGet(cat, ['openGraph', 'url'], ''),
        ogType: safeGet(cat, ['openGraph', 'type'], ''),
        ogImage: safeGet(cat, ['openGraph', 'images', 0, 'url'], ''),
        ogImageWidth: safeGet(cat, ['openGraph', 'images', 0, 'width'], 1200),
        ogImageHeight: safeGet(cat, ['openGraph', 'images', 0, 'height'], 630),
        twitterTitle: safeGet(cat, ['twitter', 'title'], ''),
        twitterDescription: safeGet(cat, ['twitter', 'description'], ''),
        twitterImage: safeGet(cat, ['twitter', 'images', 0], ''),
        schema: cat.schema || {},
        icon: cat.icon || '',
        accessibleLabel: cat.accessibleLabel || '',
        type: cat.type,
        postCount: 0 // Seed as zero; update dynamically via post creation logic
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