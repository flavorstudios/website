import { type NextRequest, NextResponse } from "next/server"
import { categoryStore, initializeDefaultCategories } from "@/lib/category-store"

export async function GET() {
  try {
    const categories = await categoryStore.getAll()

    // If no categories exist, initialize defaults
    if (categories.length === 0) {
      console.log("No categories found, initializing defaults...")
      await initializeDefaultCategories()
      const newCategories = await categoryStore.getAll()
      return NextResponse.json({ categories: newCategories })
    }

    // Check if we have video categories specifically
    const videoCategories = categories.filter((cat) => cat.type === "video")
    if (videoCategories.length === 0) {
      console.log("No video categories found, reinitializing...")
      await initializeDefaultCategories()
      const updatedCategories = await categoryStore.getAll()
      return NextResponse.json({ categories: updatedCategories })
    }

    console.log("Returning categories:", {
      total: categories.length,
      video: videoCategories.length,
      blog: categories.filter((cat) => cat.type === "blog").length,
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)

    // Return comprehensive fallback categories if database fails
    const fallbackCategories = [
      // Blog categories
      {
        id: "blog_1",
        name: "Anime Reviews",
        type: "blog",
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "blog_2",
        name: "Behind the Scenes",
        type: "blog",
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      // Video categories
      {
        id: "video_1",
        name: "Original Anime",
        type: "video",
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "video_2",
        name: "Short Films",
        type: "video",
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "video_3",
        name: "Behind the Scenes",
        type: "video",
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "video_4",
        name: "Tutorials & Guides",
        type: "video",
        isActive: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "video_5",
        name: "Anime Trailers",
        type: "video",
        isActive: true,
        order: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "video_6",
        name: "YouTube Highlights",
        type: "video",
        isActive: true,
        order: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
    ]

    return NextResponse.json({ categories: fallbackCategories })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const category = await categoryStore.create(data)
    return NextResponse.json({ category })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 400 })
  }
}
