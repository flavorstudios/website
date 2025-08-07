import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

interface HistoryPoint {
  date: string
  posts: number
  views: number
  comments: number
}

let historyCache: { data: HistoryPoint[]; expires: number } | null = null

export async function GET(request: NextRequest) {
  const sessionInfo = await getSessionInfo(request)
  const hasAccess = await requireAdmin(request, "canViewAnalytics")

  if (!hasAccess) {
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

    const now = new Date()
    if (historyCache && historyCache.expires > Date.now()) {
      return NextResponse.json({ history: historyCache.data }, { status: 200 })
    }

    const months: HistoryPoint[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
      months.push({ date: label, posts: 0, views: 0, comments: 0 })
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()

    const [postsSnap, videosSnap, commentsSnap] = await Promise.all([
      adminDb.collection("blogs").where("createdAt", ">=", startDate).get(),
      adminDb.collection("videos").where("createdAt", ">=", startDate).get(),
      adminDb.collection("comments").where("createdAt", ">=", startDate).get(),
    ])

    postsSnap.forEach((doc) => {
      const data = doc.data() as any
      const d = new Date(data.createdAt)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
      const item = months.find((m) => m.date === key)
      if (item) {
        item.posts += 1
        if (typeof data.views === "number") item.views += data.views
      }
    })

    videosSnap.forEach((doc) => {
      const data = doc.data() as any
      const d = new Date(data.createdAt)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
      const item = months.find((m) => m.date === key)
      if (item && typeof data.views === "number") {
        item.views += data.views
      }
    })

    commentsSnap.forEach((doc) => {
      const data = doc.data() as any
      const d = new Date(data.createdAt)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
      const item = months.find((m) => m.date === key)
      if (item) item.comments += 1
    })

    historyCache = { data: months, expires: Date.now() + 60_000 }

    return NextResponse.json({ history: months }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch history stats:", error)
    return NextResponse.json({ error: "Failed to fetch history stats" }, { status: 500 })
  }
}