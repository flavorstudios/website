// app/api/blogs/route.ts

import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store"; // Firestore-backed store
import { formatPublicBlog } from "@/lib/formatters"; // Your existing formatter
import { logError } from "@/lib/log"; // Add error logging

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
    // Log error using the helper for diagnostics
    logError("blogs:GET", error);

    // Return a safe error response
    return NextResponse.json(
      { error: "Failed to fetch published blogs." },
      { status: 500 }
    );
  }
}
