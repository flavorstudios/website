import { NextResponse } from "next/server";
import { videoStore } from "@/lib/prisma-video-store"; // ✅ Switched to Prisma store

export async function GET() {
  try {
    const videos = await videoStore.getAll();

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
    }));

    return NextResponse.json({ videos: formattedVideos }, { status: 200 });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch videos",
        videos: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const videoData = await request.json();

    if (!videoData.title || !videoData.youtubeId) {
      return NextResponse.json(
        { error: "Title and YouTube ID are required" },
        { status: 400 }
      );
    }

    const video = await videoStore.create({
      title: videoData.title,
      slug:
        videoData.slug ||
        videoData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      description: videoData.description || "",
      youtubeId: videoData.youtubeId,
      thumbnail:
        videoData.thumbnail ||
        `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`,
      duration: videoData.duration || "0:00",
      category: videoData.category || "Episodes",
      tags: videoData.tags || [],
      status: videoData.status || "draft",
      publishedAt: videoData.publishedAt || new Date().toISOString(),
      featured: videoData.featured || false,
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}