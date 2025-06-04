import { NextResponse } from "next/server"
import { categoryStore } from "@/lib/category-store"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get("type") || "blog" // default to 'blog'

    // Get categories by type, only active
    const categories = await categoryStore.getByType(type)

    // Filter out any 'all' slug just in case
    const filtered = categories.filter(cat => cat.slug !== "all")

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
