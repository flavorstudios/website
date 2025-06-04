import { NextResponse } from "next/server"
import { videoStore } from "@/lib/video"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const categorySlug = url.searchParams.get("category") || "all"

    // Fetch all published videos
    let videos = await videoStore.getAllVideos()

    // Filter by category if not 'all'
    if (categorySlug !== "all") {
      videos = videos.filter(video => video.category === categorySlug)
    }

    // Ensure only published videos
    videos = videos.filter(video => video.status === "published")

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Failed to fetch videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}
