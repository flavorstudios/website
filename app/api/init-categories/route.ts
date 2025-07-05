import { NextResponse } from "next/server"

// If you want, import your real category initializer here
// import { initializeDefaultCategories } from "@/lib/category-store"

export async function GET() {
  try {
    // If you want to run a real initializer (eg. for seeding categories via Prisma, uncomment below)
    // await initializeDefaultCategories()

    return NextResponse.json({
      success: true,
      message: "Categories initialized successfully"
      // No static or fallback category arrays
    })
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    return NextResponse.json({ success: false, error: "Failed to initialize categories" }, { status: 500 })
  }
}
