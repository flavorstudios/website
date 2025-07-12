// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// --- This block replaces __dirname for ES modules!
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // 1. Path to your categories.json
  const filePath = join(__dirname, '../content-data/categories.json');
  const jsonData = await readFile(filePath, 'utf-8');
  const categoriesObj = JSON.parse(jsonData).CATEGORIES;

  // 2. Prepare array for Prisma
  const allCategories = [
    ...(categoriesObj.blog || []).map(({ title, ...rest }) => ({
      ...rest,
      type: 'BLOG',
      name: title || '',
    })),
    ...(categoriesObj.watch || []).map(({ title, ...rest }) => ({
      ...rest,
      type: 'VIDEO',
      name: title || '',
    })),
  ];

  // 3. Remove all existing rows so only fresh JSON data exists
  await prisma.category.deleteMany();

  // 4. Seed categories from your JSON
  let seeded = 0;
  for (const category of allCategories) {
    try {
      await prisma.category.create({ data: category });
      seeded++;
    } catch (err) {
      console.error(`❌ Failed to insert: ${category.slug} (${category.type})`, err);
    }
  }

  console.log(`✅ Categories seeded successfully! (${seeded} added)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
