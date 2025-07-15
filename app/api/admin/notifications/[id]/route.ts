import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { read } = await request.json()

    // In a real application, this would update the notification in Firestore
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Notification updated",
    })
  } catch (error) {
    console.error("Failed to update notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
