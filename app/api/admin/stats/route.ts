import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return static stats for now - can be made dynamic later
    const stats = {
      youtubeSubscribers: "500K+",
      originalEpisodes: "50+",
      totalViews: "2M+",
      yearsCreating: "5",
      totalBlogs: 25,
      totalVideos: 48,
      totalComments: 1250,
      monthlyViews: 150000,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
