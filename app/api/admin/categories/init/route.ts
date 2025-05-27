import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { initializeDefaultCategories } = await import("@/lib/category-store")

    // Force initialization of default categories
    await initializeDefaultCategories()

    // Verify categories were created
    const { categoryStore } = await import("@/lib/category-store")
    const allCategories = await categoryStore.getAll()
    const videoCategories = allCategories.filter((cat) => cat.type === "video")

    console.log("Initialized categories:", {
      total: allCategories.length,
      video: videoCategories.length,
      videoNames: videoCategories.map((cat) => cat.name),
    })

    return NextResponse.json({
      success: true,
      message: "Categories initialized",
      videoCategories: videoCategories.length,
    })
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    return NextResponse.json({ error: "Failed to initialize categories" }, { status: 500 })
  }
}
