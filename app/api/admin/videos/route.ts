// app/api/admin/videos/route.ts
import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
// ⬇️ Audit fix: use the proper store
import { videoStore } from "@/lib/content-store";

// Narrowed structural type to avoid `any` without introducing new imports
type VideoItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  youtubeId?: string;
  thumbnail?: string;
  duration?: string | number;
  category?: string;
  tags?: string[];
  status: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  views?: number;
  featured?: boolean;
};

export async function GET(request: NextRequest) {
  // Guard against missing/invalid session in tests or edge cases
  try {
    const allowed = await requireAdmin(request, "canManageVideos");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Support tag filtering: /api/admin/videos?tags=tag1,tag2
    const tagsParam = request.nextUrl.searchParams.get("tags");
    const tags =
      tagsParam?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

    let videos = (await videoStore.getAll()) as VideoItem[];

    if (tags.length > 0) {
      // Keep videos that contain ALL requested tags
      videos = videos.filter((video) =>
        tags.every((tag) => (video.tags ?? []).includes(tag))
      );
    }

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

export async function POST(request: NextRequest) {
  // Guard against missing/invalid session in tests or edge cases
  try {
    const allowed = await requireAdmin(request, "canManageVideos");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videoData = await request.json();

    // Validate required fields
    if (!videoData.title || !videoData.youtubeId || !videoData.slug) {
      return NextResponse.json(
        {
          error: "Title, slug and YouTube ID are required",
        },
        { status: 400 }
      );
    }

    const video = await videoStore.create({
      title: videoData.title,
      slug: videoData.slug, // <--- Save the slug
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
      {
        error: "Failed to create video",
      },
      { status: 500 }
    );
  }
}
