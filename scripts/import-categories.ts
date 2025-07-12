// D:\website\scripts\import-categories.ts

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Main function to import categories from a JSON file into the database.
 * This script now correctly handles the 'type' field and maps 'title' to 'name'.
 * It also ensures that the 'title' field (which is not in the Prisma schema)
 * is not passed to Prisma, resolving the "Unknown argument `title`" error.
 * It uses Prisma's `upsert` operation for idempotent imports.
 */
async function main() {
  // Define the path to your categories JSON file.
  // This assumes 'content-data' is a sibling directory to 'scripts'
  // (i.e., both are directly under the project root).
  const filePath = join(__dirname, '../content-data/categories.json');

  try {
    // Read the JSON file content
    const jsonData = await readFile(filePath, 'utf-8');

    // Parse the JSON data. It's an object with 'CATEGORIES' containing 'blog' and 'watch' arrays.
    const categoriesObj = JSON.parse(jsonData).CATEGORIES;

    // Prepare a combined array of categories.
    // For each category:
    // 1. Assign the correct 'type' ('BLOG' or 'VIDEO').
    // 2. Map the 'title' field from JSON to the 'name' field required by Prisma.
    // 3. Omit the original 'title' field as it's not in the Prisma schema.
    const allCategoriesToImport = [
      ...(categoriesObj.blog || []).map(({ title, ...rest }) => ({
        ...rest,
        type: 'BLOG',
        name: title || '', // Use 'title' for 'name'
      })),
      ...(categoriesObj.watch || []).map(({ title, ...rest }) => ({
        ...rest,
        type: 'VIDEO',
        name: title || '', // Use 'title' for 'name'
      })),
    ];

    console.log(`Starting import of ${allCategoriesToImport.length} categories...`);

    // Iterate over each category and upsert it into the database.
    for (const category of allCategoriesToImport) {
      // The 'category' object here already has 'name' and no 'title'.
      // It also has 'type' correctly assigned.
      await prisma.category.upsert({
        where: {
          slug_type: { // This refers to the @@unique([slug, type]) constraint in your schema
            slug: category.slug,
            type: category.type,
          },
        },
        update: category, // 'category' now contains only schema-compatible fields
        create: category, // 'category' now contains only schema-compatible fields
      });
      console.log(
        `Upserted: [${category.type}] ${category.name} (Slug: ${category.slug})`
      );
    }

    console.log('✅ All categories imported successfully!');
  } catch (error) {
    console.error('❌ Error during category import:', error);
    // Re-throw the error to be caught by the outer .catch() block
    throw error;
  }
}

// Execute the main function and handle any errors or final cleanup.
main()
  .catch(e => {
    // Log the error and exit the process with a failure code
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Ensure the Prisma client connection is gracefully disconnected
    await prisma.$disconnect();
    console.log('Database connection closed.');
  });
