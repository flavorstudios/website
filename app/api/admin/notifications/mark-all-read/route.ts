import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // In a real application, this would update all notifications in Firestore
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
