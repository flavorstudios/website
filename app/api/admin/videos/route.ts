import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { videoStore } from "@/lib/content-store"

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const videos = await videoStore.getAll()

    const formattedVideos = videos.map((video) => ({
      id: video.id,
      slug: video.slug || video.id,
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      thumbnail: video.thumbnail,
      duration: video.duration,
      category: video.category,
      tags: video.tags,
      status: video.status,
      published: video.status === "published",
      publishedAt: video.publishedAt,
      updatedAt: video.updatedAt,
      createdAt: video.createdAt,
      views: video.views,
      featured: video.featured,
    }))

    return NextResponse.json({ videos: formattedVideos }, { status: 200 })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch videos",
        videos: [], // Return empty array as fallback
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const videoData = await request.json()

    // Validate required fields
    if (!videoData.title || !videoData.youtubeId) {
      return NextResponse.json(
        {
          error: "Title and YouTube ID are required",
        },
        { status: 400 },
      )
    }

    const video = await videoStore.create({
      title: videoData.title,
      description: videoData.description || "",
      youtubeId: videoData.youtubeId,
      thumbnail: videoData.thumbnail || `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`,
      duration: videoData.duration || "0:00",
      category: videoData.category || "Episodes",
      tags: videoData.tags || [],
      status: videoData.status || "draft",
      publishedAt: videoData.publishedAt || new Date().toISOString(),
      featured: videoData.featured || false,
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json(
      {
        error: "Failed to create video",
      },
      { status: 500 },
    )
  }
}
