import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/activity - Only for authorized admins
export async function GET(req: NextRequest) {
  // Check admin role and "canViewAnalytics" permission
  if (!(await requireAdmin(req, "canViewAnalytics"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // TODO: Replace with real Firestore query for activity log
    return NextResponse.json({
      activities: [], // Placeholder, replace with fetched activities
      success: true,
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
