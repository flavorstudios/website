import { initializeDefaultCategories } from "../lib/category-store";
import defaultCategories from "../content-data/categories.json"; // Import the centralized categories JSON

async function main() {
  try {
    console.log("Initializing categories from content-data/categories.json...");
    await initializeDefaultCategories(defaultCategories); // Pass your default categories
    console.log("Categories initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to initialize categories:", error);
    process.exit(1);
  }
}

main();