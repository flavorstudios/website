import { NextResponse } from "next/server";
import { videoStore } from "@/lib/content-store"; // Or content-store if renamed
import { formatPublicVideo } from "@/lib/formatters"; // NEW: Formatting helper

export async function GET() {
  try {
    const videos = await videoStore.getAll();
    const published = videos.filter((v: any) => v.status === "published");
    const result = published.map(formatPublicVideo); // Use the shared helper
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    console.error("Failed to fetch published videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch published videos." },
      { status: 500 }
    );
  }
}
