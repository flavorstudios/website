// prisma/seed.ts
import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed a set of default categories when none exist.
 * Categories are created for both BLOG and VIDEO types.
 */
async function seedCategories() {
  const count = await prisma.category.count();
  if (count > 0) {
    console.log(`Categories already exist (${count}); skipping seeding.`);
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

  console.log('✅ Default categories seeded successfully.');
}

async function main() {
  await seedCategories();
}

main()
  .catch((err) => {
    console.error('❌ Seed script error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
