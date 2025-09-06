import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { videoStore } from "@/lib/comment-store"
import { logActivity } from "@/lib/activity-log"

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageVideos"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const videos = await videoStore.getAll()

    const formattedVideos = videos.map((video) => ({
      id: video.id,
      slug: video.slug, // <--- Always use slug, no fallback
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
        videos: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageVideos"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const videoData = await request.json()

    // Validate required fields
    if (!videoData.title || !videoData.youtubeId || !videoData.slug) {
      return NextResponse.json(
        {
          error: "Title, slug and YouTube ID are required",
        },
        { status: 400 },
      )
    }

    const video = await videoStore.create({
      title: videoData.title,
      slug: videoData.slug, // <--- Save the slug
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
    const actor = await getSessionInfo(request)
    await logActivity({
      type: "video.create",
      title: video.title,
      description: `Created video ${video.title}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
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
