import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store"; // (or content-store, if you rename)
import { formatPublicBlog } from "@/lib/formatters"; // NEW: helper for formatting

export async function GET() {
  try {
    const blogs = await blogStore.getAll();
    const published = blogs.filter((b: any) => b.status === "published");
    const result = published.map(formatPublicBlog);
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    console.error("Failed to fetch published blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch published blogs." },
      { status: 500 }
    );
  }
}
