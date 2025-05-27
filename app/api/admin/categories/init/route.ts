import { NextResponse } from "next/server"
import { initializeDefaultCategories } from "@/lib/category"
import { categoryStore } from "@/lib/stores/category-store"

export async function POST() {
  try {
    await initializeDefaultCategories()

    // Verify categories were created
    const categories = await categoryStore.getAll()
    const videoCategories = categories.filter((cat) => cat.type === "video")

    if (videoCategories.length === 0) {
      // Force create video categories if they don't exist
      const defaultVideoCategories = [
        "Original Anime",
        "Short Films",
        "Behind the Scenes",
        "Tutorials & Guides",
        "Anime Trailers",
        "YouTube Highlights",
      ]

      for (let i = 0; i < defaultVideoCategories.length; i++) {
        await categoryStore.create({
          name: defaultVideoCategories[i],
          type: "video",
          description: `Videos related to ${defaultVideoCategories[i].toLowerCase()}`,
          color: `hsl(${(i * 60) % 360}, 70%, 50%)`,
          order: i,
          isActive: true,
        })
      }
    }

    return NextResponse.json({ success: true, message: "Categories initialized" })
  } catch (error) {
    console.error("Failed to initialize categories:", error)
    return NextResponse.json({ error: "Failed to initialize categories" }, { status: 500 })
  }
}
