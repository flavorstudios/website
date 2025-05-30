import { NextResponse } from "next/server"

// Static categories that match your screenshot
const CATEGORIES = [
  { name: "Anime News", slug: "anime-news", count: 0 },
  { name: "Reviews", slug: "reviews", count: 0 },
  { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
  { name: "Tutorials", slug: "tutorials", count: 0 },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      blogCategories: CATEGORIES,
      videoCategories: CATEGORIES,
    })
  } catch (error) {
    console.error("Failed to get categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get categories",
        blogCategories: CATEGORIES,
        videoCategories: CATEGORIES,
      },
      { status: 500 },
    )
  }
}
