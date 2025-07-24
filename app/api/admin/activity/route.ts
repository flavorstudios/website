import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/activity - Only for authorized admins
export async function GET(req: NextRequest) {
  // Use the improved getSessionInfo helper
  const sessionInfo = await getSessionInfo(req)

  if (process.env.DEBUG_ADMIN === "true") {
    console.log("[admin-activity] sessionInfo:", sessionInfo)
  }

  const hasAccess = await requireAdmin(req, "canViewAnalytics")

  if (!hasAccess) {
    // Include the computed role, email, and uid in the error response for debugging
    return NextResponse.json(
      {
        error: "Unauthorized",
        role: sessionInfo?.role || "unknown",
        email: sessionInfo?.email || "unknown",
        uid: sessionInfo?.uid || "unknown",
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
