import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { commentStore } from "@/lib/content-store"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { status } = await request.json()
    const comment = await commentStore.updateStatus(params.id, status)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const success = await commentStore.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
