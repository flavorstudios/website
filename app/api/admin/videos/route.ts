import { NextResponse } from "next/server"
import { videoStore } from "@/lib/content-store"

export async function GET() {
  try {
    const videos = await videoStore.getAll()

    const formattedVideos = videos.map((video) => ({
      id: video.id,
      slug: video.slug,
      title: video.title,
      published: video.status === 'published',
      publishedAt: video.publishedAt,
      updatedAt: video.updatedAt,
      createdAt: video.createdAt,
    }))

    return NextResponse.json({ videos: formattedVideos }, { status: 200 })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}
