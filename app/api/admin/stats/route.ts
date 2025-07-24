import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

// This API returns dashboard analytics stats for authorized admins only.
export async function GET(request: NextRequest) {
  // Get session and role info for debugging
  const sessionInfo = await getSessionAndRole(request)
  const hasAccess = await requireAdmin(request, "canViewAnalytics")

  if (!hasAccess) {
    // 401 includes computed role and email for diagnostics
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
    // TODO: Replace placeholder zeros with actual Firestore queries
    const stats = {
      totalPosts: 0,         // Real: await adminDb.collection("blogs").count()
      totalVideos: 0,        // Real: await adminDb.collection("videos").count()
      totalComments: 0,      // Real: await adminDb.collection("comments").count()
      totalViews: 0,         // Real: await analyticsDb.collection("views").sum("count")
      pendingComments: 0,    // Real: await adminDb.collection("comments").where("approved", "==", false).count()
      publishedPosts: 0,     // Real: await adminDb.collection("blogs").where("status", "==", "published").count()
      featuredVideos: 0,     // Real: await adminDb.collection("videos").where("featured", "==", true).count()
      monthlyGrowth: 0,      // Real: calculate based on current/prior month
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
