import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { AggregateField, Timestamp } from "firebase-admin/firestore"
import { createHash } from "crypto"

// Base stats shape
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

type MonthlyStats = {
  month: string // e.g. "Jan"
  posts: number
  videos: number
  comments: number
}

// Response can optionally include history
type StatsResponse = Stats & { history?: MonthlyStats[] }

// Short-lived cache (60s), keyed by `range`
const statsCache: Record<string, { data: StatsResponse; expires: number }> = {}

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
    const range = request.nextUrl.searchParams.get("range") || "default"
    const now = Date.now()
    const ifNoneMatch = request.headers.get("if-none-match")

    // ✅ Early fallback if Firestore is not configured
    if (!adminDb) {
      const empty: StatsResponse = {
        totalPosts: 0,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
        ...(range === "12mo" ? { history: [] } : {}),
      }
      const etag = `"${createHash("md5").update(JSON.stringify(empty)).digest("hex")}"`
      if (ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "no-cache",
          },
        })
      }
      return NextResponse.json(empty, {
        status: 200,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache",
        },
      })
    }

    // Serve from cache if available (TTL: 60s)
    const cached = statsCache[range]
    if (cached && cached.expires > now) {
      const etag = `"${createHash("md5").update(JSON.stringify(cached.data)).digest("hex")}"`
      if (process.env.DEBUG_ADMIN === "true") {
        console.log("[admin-stats] Returning cached stats (range:", range, "):", cached.data)
      }
      if (ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "no-cache",
          },
        })
      }
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache",
        },
      })
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

    const base: Stats = {
      totalPosts: totalPostsSnap.data().count,
      totalVideos: totalVideosSnap.data().count,
      totalComments: totalCommentsSnap.data().count,
      totalViews: (blogViewsSnap.data().views || 0) + (videoViewsSnap.data().views || 0),
      pendingComments: pendingCommentsSnap.data().count,
      publishedPosts: publishedPostsSnap.data().count,
      featuredVideos: featuredVideosSnap.data().count,
      monthlyGrowth: 0, // keep as-is; compute later if needed
    }

    let history: MonthlyStats[] | undefined

    // Optional 12-month history for charts
    if (range === "12mo") {
      history = []
      const current = new Date()

      for (let i = 11; i >= 0; i--) {
        const start = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - i, 1))
        const end = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - i + 1, 1))

        const startTs = Timestamp.fromDate(start)
        const endTs = Timestamp.fromDate(end)

        const [postSnap, videoSnap, commentSnap] = await Promise.all([
          adminDb.collection("blogs").where("createdAt", ">=", startTs).where("createdAt", "<", endTs).count().get(),
          adminDb.collection("videos").where("createdAt", ">=", startTs).where("createdAt", "<", endTs).count().get(),
          // Adjust this to your comments collection structure.
          // Using a collectionGroup example for nested comment entries:
          adminDb.collectionGroup("entries").where("createdAt", ">=", startTs).where("createdAt", "<", endTs).count().get(),
        ])

        history.push({
          month: start.toLocaleString("default", { month: "short" }),
          posts: postSnap.data().count,
          videos: videoSnap.data().count,
          comments: commentSnap.data().count,
        })
      }
    }

    const response: StatsResponse = history ? { ...base, history } : base

    // Update cache for this range
    statsCache[range] = { data: response, expires: now + 60_000 }

    if (process.env.DEBUG_ADMIN === "true") {
      console.log("[admin-stats] Returning stats (range:", range, "):", response)
    }

    // Compute ETag and honor If-None-Match
    const etag = `"${createHash("md5").update(JSON.stringify(response)).digest("hex")}"`
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache",
        },
      })
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        ETag: etag,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
