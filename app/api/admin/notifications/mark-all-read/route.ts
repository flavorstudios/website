import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { getNotificationsService } from "@/lib/notifications"
import { publishToUser } from "@/lib/sse-broker"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // Determine which user's notifications to mark as read.
    // Replace this with your real session/user resolution.
    const userId =
      request.headers.get("x-admin-user") ||
      request.headers.get("x-user-id") ||
      "admin"

    const svc = getNotificationsService()
    await svc.markAllRead(userId)

    // Notify connected clients (SSE) so UI badges/popovers update immediately
    publishToUser(userId, "mark-all-read", {})

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    )
  }
}
