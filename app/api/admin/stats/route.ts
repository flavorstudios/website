import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { AggregateField } from "firebase-admin/firestore"

// Type for the stats response
type Stats = {
  totalPosts: number
  totalVideos: number
  totalComments: number
  totalViews: number
  pendingComments: number
  publishedPosts: number
  featuredVideos: number
  monthlyGrowth: number
}

// Short-lived cache (60s) to avoid expensive repeat queries
let statsCache: { data: Stats; expires: number } | null = null

export async function GET(request: NextRequest) {
  const sessionInfo = await getSessionInfo(request)

  if (process.env.DEBUG_ADMIN === "true") {
    console.log("[admin-stats] Incoming request at", new Date().toISOString())
    console.log("[admin-stats] sessionInfo:", sessionInfo)
  }

  const hasAccess = await requireAdmin(request, "canViewAnalytics")

  if (process.env.DEBUG_ADMIN === "true") {
    console.log("[admin-stats] hasAccess:", hasAccess, "| role:", sessionInfo?.role, "| email:", sessionInfo?.email)
  }

  if (!hasAccess) {
    if (process.env.DEBUG_ADMIN === "true") {
      console.warn("[admin-stats] ACCESS DENIED. Details:", {
        ip: request.headers.get("x-forwarded-for"),
        role: sessionInfo?.role,
        email: sessionInfo?.email,
        uid: sessionInfo?.uid,
      })
    }
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
    if (!adminDb) throw new Error("Firestore not initialized")

    // Serve from cache if available (TTL: 60s)
    const now = Date.now()
    if (statsCache && statsCache.expires > now) {
      if (process.env.DEBUG_ADMIN === "true") {
        console.log("[admin-stats] Returning cached stats:", statsCache.data)
      }
      return NextResponse.json(statsCache.data, { status: 200 })
    }

    // Fetch Firestore stats in parallel
    const [
      totalPostsSnap,
      totalVideosSnap,
      totalCommentsSnap,
      blogViewsSnap,
      videoViewsSnap,
      pendingCommentsSnap,
      publishedPostsSnap,
      featuredVideosSnap,
    ] = await Promise.all([
      adminDb.collection("blogs").count().get(),
      adminDb.collection("videos").count().get(),
      adminDb.collection("comments").count().get(),
      adminDb.collection("blogs").aggregate({ views: AggregateField.sum("views") }).get(),
      adminDb.collection("videos").aggregate({ views: AggregateField.sum("views") }).get(),
      adminDb.collection("comments").where("approved", "==", false).count().get(),
      adminDb.collection("blogs").where("status", "==", "published").count().get(),
      adminDb.collection("videos").where("featured", "==", true).count().get(),
    ])

    const stats: Stats = {
      totalPosts: totalPostsSnap.data().count,
      totalVideos: totalVideosSnap.data().count,
      totalComments: totalCommentsSnap.data().count,
      totalViews: (blogViewsSnap.data().views || 0) + (videoViewsSnap.data().views || 0),
      pendingComments: pendingCommentsSnap.data().count,
      publishedPosts: publishedPostsSnap.data().count,
      featuredVideos: featuredVideosSnap.data().count,
      monthlyGrowth: 0, // TODO: Implement monthly growth if needed
    }

    // Update cache
    statsCache = { data: stats, expires: now + 60_000 }

    if (process.env.DEBUG_ADMIN === "true") {
      console.log("[admin-stats] Returning stats:", stats)
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
