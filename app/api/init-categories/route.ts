import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple initialization - just return success
    // The categories will be generated dynamically from the fallback
    return NextResponse.json({
      success: true,
      message: "Categories initialized successfully",
      categories: {
        blog: ["Anime News", "Reviews", "Behind the Scenes", "Tutorials"],
        video: ["Anime News", "Reviews", "Behind the Scenes", "Tutorials"],
      },
    })
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    return NextResponse.json({ success: false, error: "Failed to initialize categories" }, { status: 500 })
  }
}
