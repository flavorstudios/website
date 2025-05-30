import { initializeDefaultCategories } from "../lib/category-store"

async function main() {
  try {
    console.log("Initializing categories for production...")
    await initializeDefaultCategories()
    console.log("Categories initialized successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    process.exit(1)
  }
}

main()
