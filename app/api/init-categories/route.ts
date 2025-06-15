import { NextResponse } from "next/server";
import { initializeDefaultCategories } from "@/lib/category-store";
import defaultCategories from "@/content-data/categories.json"; // (Optional: Only if you want to load default structure)

export async function GET() {
  try {
    // Initialize the categories in your centralized store (safe if already initialized)
    await initializeDefaultCategories(defaultCategories);

    return NextResponse.json({
      success: true,
      message: "Categories initialized successfully",
    });
  } catch (error) {
    console.error("Failed to initialize categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize categories" },
      { status: 500 }
    );
  }
}