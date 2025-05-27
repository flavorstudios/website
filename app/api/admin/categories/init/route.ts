import { NextResponse } from "next/server"
import { categoryStore, initializeDefaultCategories } from "@/lib/category-store"

export async function POST() {
  try {
    // Check if categories already exist
    const existingCategories = await categoryStore.getAll()

    if (existingCategories.length === 0) {
      // Initialize default categories
      await initializeDefaultCategories()
    }

    return NextResponse.json({
      success: true,
      message: "Categories initialized successfully",
    })
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    return NextResponse.json({ error: "Failed to initialize categories" }, { status: 500 })
  }
}
