import { NextResponse } from "next/server"
import { getDynamicCategories } from "@/lib/dynamic-categories"

export async function GET() {
  try {
    const { blogCategories, videoCategories } = await getDynamicCategories()

    return NextResponse.json({
      success: true,
      blogCategories,
      videoCategories,
    })
  } catch (error) {
    console.error("Failed to get categories:", error)

    // Fallback categories
    const fallbackCategories = [
      { name: "Anime News", slug: "anime-news", count: 0 },
      { name: "Reviews", slug: "reviews", count: 0 },
      { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
      { name: "Tutorials", slug: "tutorials", count: 0 },
    ]

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get categories",
        blogCategories: fallbackCategories,
        videoCategories: fallbackCategories,
      },
      { status: 500 },
    )
  }
}
