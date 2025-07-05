// scripts/init-categories.ts

import { initializeDefaultCategories } from "../lib/category-store"

async function main() {
  try {
    console.log("Initializing categories from Prisma…")
    await initializeDefaultCategories() // This should seed or sync categories with Prisma as the source
    console.log("✅ Categories initialized successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Failed to initialize categories:", error)
    process.exit(1)
  }
}

main()
