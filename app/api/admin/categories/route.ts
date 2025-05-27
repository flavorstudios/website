import { type NextRequest, NextResponse } from "next/server"
import { categoryStore, initializeDefaultCategories } from "@/lib/category-store"

export async function GET() {
  try {
    const categories = await categoryStore.getAll()

    // If no categories exist, initialize defaults
    if (categories.length === 0) {
      await initializeDefaultCategories()
      const newCategories = await categoryStore.getAll()
      return NextResponse.json({ categories: newCategories })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)

    // Return fallback categories if database fails
    const fallbackCategories = [
      {
        id: "cat_1",
        name: "Anime Reviews",
        type: "blog",
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "cat_2",
        name: "Behind the Scenes",
        type: "blog",
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 0,
      },
      {
        id: "cat_3",
        name: "Tutorials",
        type: "blog",
        isActive: true,
        order: 2,
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
