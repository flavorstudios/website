// scripts/import-categories.ts
import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script seeds the same default categories used in the main seed file.
 * It can be extended or replaced with custom logic if you have another
 * source of category data.
 */
async function importCategories() {
  const count = await prisma.category.count();
  if (count > 0) {
    console.log(`Categories already exist (${count}); skipping import.`);
    return;
  }

  const defaults = ['Anime News', 'Reviews', 'Behind the Scenes', 'Tutorials'];

  for (const [index, name] of defaults.entries()) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const base = {
      name,
      slug,
      description: `Content related to ${name.toLowerCase()}`,
      color: `hsl(${(index * 90) % 360}, 70%, 50%)`,
      order: index,
      isActive: true,
      postCount: 0,
    };

    await prisma.category.create({
      data: { ...base, type: CategoryType.BLOG },
    });

    await prisma.category.create({
      data: { ...base, type: CategoryType.VIDEO },
    });
  }

  console.log('✅ Categories imported successfully.');
}

importCategories()
  .catch((err) => {
    console.error('❌ Import script error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
