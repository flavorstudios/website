import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    const formattedVideos = videos.map((video) => ({
      id: video.id,
      slug: video.slug,
      title: video.title,
      published: video.published,
      publishedAt: video.publishedAt ? video.publishedAt.toISOString() : null,
      updatedAt: video.updatedAt.toISOString(),
      createdAt: video.createdAt.toISOString(),
    }))

    return NextResponse.json({ videos: formattedVideos }, { status: 200 })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}
