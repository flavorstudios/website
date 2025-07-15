import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { categoryStore, initializeDefaultCategories } from "@/lib/category-store"

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // Initialize default categories if none exist
    await initializeDefaultCategories()

    // Update post counts for all categories
    await categoryStore.updatePostCounts()

    return NextResponse.json({
      success: true,
      message: "Categories synced successfully",
    })
  } catch (error) {
    console.error("Category sync error:", error)
    return NextResponse.json({ error: "Failed to sync categories" }, { status: 500 })
  }
}
