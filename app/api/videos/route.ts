// app/api/videos/route.ts

import { NextResponse } from "next/server";
import { videoStore } from "@/lib/content-store"; // Firestore store
import { formatPublicVideo } from "@/lib/formatters"; // Helper for safe public output
import type { Video } from "@/lib/content-store"; // Import Video type

export async function GET() {
  try {
    // Fetch all videos from Firestore
    const videos = await videoStore.getAll();

    // Only published videos for the public API
    const published = videos.filter((v: Video) => v.status === "published");
    const result = published.map(formatPublicVideo);

    // JSON response, cache for 5 minutes
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    // Log details server-side only
    console.error("Failed to fetch published videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch published videos." },
      { status: 500 }
    );
  }
}
