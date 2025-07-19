// app/api/blogs/route.ts

import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store"; // Firestore-backed store
import { formatPublicBlog } from "@/lib/formatters"; // Your existing formatter

export async function GET() {
  try {
    // Fetch all blogs from Firestore (via blogStore)
    const blogs = await blogStore.getAll();

    // Only published blogs (same as before)
    const published = blogs.filter((b) => b.status === "published");

    // Format for the public API response
    const result = published.map(formatPublicBlog);

    // Send response with cache headers
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    // Log error for diagnostics
    console.error("Failed to fetch published blogs:", error);

    // Return a safe error response
    return NextResponse.json(
      { error: "Failed to fetch published blogs." },
      { status: 500 }
    );
  }
}
