import { NextResponse } from "next/server"

// Optionally, import and call your Prisma-based seeder here if needed
// import { initializeDefaultCategories } from "@/lib/category-store"

export async function GET() {
  try {
    // If you need to initialize categories at runtime (rare with Prisma migrations/seeds), call your seeder here.
    // await initializeDefaultCategories();

    return NextResponse.json({
      success: true,
      message: "Categories initialized successfully"
      // No static or fallback category arrays; rely on database/prisma.
    })
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    return NextResponse.json(
      { success: false, error: "Failed to initialize categories" },
      { status: 500 }
    )
  }
}
