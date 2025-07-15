import { NextResponse } from "next/server";
import { videoStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const videos = await videoStore.getAll();
    const published = videos.filter((v: any) => v.status === "published");
    const result = published.map((video: any) => ({
      id: video.id,
      title: video.title,
      slug: video.slug || video.id,
      youtubeId: video.youtubeId,
      thumbnail: video.thumbnail,
      description: video.description,
      category: video.category,
      tags: video.tags,
      duration: video.duration,
      publishedAt: video.publishedAt,
      featured: video.featured,
    }));
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    console.error("Failed to fetch published videos:", error);
    return NextResponse.json([], { status: 500 });
  }
}
