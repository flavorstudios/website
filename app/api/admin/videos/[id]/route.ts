import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { videoStore } from "@/lib/content-store"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const data = await request.json()
    const video = await videoStore.update(params.id, data)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }
    return NextResponse.json(video)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const success = await videoStore.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
