import { type NextRequest, NextResponse } from "next/server"
import { categoryStore } from "@/lib/category-store"

export async function GET() {
  try {
    const categories = await categoryStore.getAll()
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
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
