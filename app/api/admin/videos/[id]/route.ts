import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { videoStore } from "@/lib/comment-store"
import { logActivity } from "@/lib/activity-log"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request, "canManageVideos"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const data = await request.json()
    const video = await videoStore.update(id, data)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }
    const actor = await getSessionInfo(request)
    await logActivity({
      type: "video.update",
      title: video.title || id,
      description: `Updated video ${id}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    })
    return NextResponse.json(video)
  } catch {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request, "canManageVideos"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const success = await videoStore.delete(id)
    if (!success) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }
    const actor = await getSessionInfo(request)
    await logActivity({
      type: "video.delete",
      title: id,
      description: `Deleted video ${id}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
