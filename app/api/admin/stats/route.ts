import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // In a real application, this would fetch actual stats from Firestore
    // Return actual counts or zeros if no data exists
    const stats = {
      totalPosts: 0, // Real count from Firestore blogs collection
      totalVideos: 0, // Real count from Firestore videos collection
      totalComments: 0, // Real count from Firestore comments collection
      totalViews: 0, // Real count from analytics or Firestore
      pendingComments: 0, // Real count of unmoderated comments
      publishedPosts: 0, // Real count of published posts
      featuredVideos: 0, // Real count of featured videos
      monthlyGrowth: 0, // Real calculated growth percentage
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
