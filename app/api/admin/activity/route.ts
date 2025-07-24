import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/activity - Only for authorized admins
export async function GET(req: NextRequest) {
  // Check admin role and "canViewAnalytics" permission
  const sessionInfo = await getSessionAndRole(req)
  const hasAccess = await requireAdmin(req, "canViewAnalytics")

  if (!hasAccess) {
    // Include the computed role and email in the error response for debugging
    return NextResponse.json(
      {
        error: "Unauthorized",
        role: sessionInfo?.role || "unknown",
        email: sessionInfo?.email || "unknown",
      },
      { status: 401 }
    )
  }
  try {
    // TODO: Replace with real Firestore query for activity log
    return NextResponse.json(
      {
        activities: [], // Placeholder, replace with fetched activities
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to fetch activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
