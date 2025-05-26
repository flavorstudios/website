import { type NextRequest, NextResponse } from "next/server"
import { categoryStore } from "@/lib/category-store"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const category = await categoryStore.update(params.id, data)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json({ category })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await categoryStore.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 400 })
  }
}
