// app/api/blogs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store"; // Firestore-backed store
import { formatPublicBlog } from "@/lib/formatters"; // Your existing formatter
import { commentStore } from "@/lib/comment-store"; // <-- add this import
import { logError } from "@/lib/log"; // Add error logging
import { BlogPost } from "@/lib/content-store";

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const authorParam = searchParams.get("author"); // "all" or author id/name
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = parseDate(startDateParam);
    const endDateRaw = parseDate(endDateParam);
    // Make endDate inclusive through end-of-day
    const endDate = endDateRaw
      ? new Date(new Date(endDateRaw).setHours(23, 59, 59, 999))
      : null;

    // Fetch all blogs from Firestore (via blogStore)
    const blogs = await blogStore.getAll();

    // Only published blogs (same as before)
    let published: BlogPost[] = blogs.filter(
      (b: BlogPost) => b.status === "published",
    );

    // Author filter (supports id or name; also handles author object)
    if (authorParam && authorParam !== "all") {
      const a = authorParam.toLowerCase();
      published = published.filter((b: BlogPost) => {
        const byId = b.authorId && String(b.authorId).toLowerCase() === a;
        const byName = typeof b.author === "string" && b.author.toLowerCase() === a;
        const byObjId = b.author?.id && String(b.author.id).toLowerCase() === a;
        const byObjName =
          b.author?.name && String(b.author.name).toLowerCase() === a;
        return byId || byName || byObjId || byObjName;
      });
    }

    // Date range filters (inclusive)
    if (startDate) {
      published = published.filter(
        (b: BlogPost) => b.publishedAt && new Date(b.publishedAt) >= startDate,
      );
    }
    if (endDate) {
      published = published.filter(
        (b: BlogPost) => b.publishedAt && new Date(b.publishedAt) <= endDate,
      );
    }

    // Attach comment counts for each post (async)
    const withCounts = await Promise.all(
      published.map(async (post: BlogPost) => {
        try {
          const comments = await commentStore.getByPost(post.id, "blog");
          return { ...post, commentCount: comments.length };
        } catch {
          return { ...post, commentCount: 0 };
        }
      }),
    );

    // Format for the public API response
    const result = withCounts.map(formatPublicBlog);

    // Send response with cache headers
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    // Log error using the helper for diagnostics
    try {
      logError("blogs:GET", error);
    } catch {
      // no-op if logger throws
    }

    // Return a safe error response
    return NextResponse.json(
      { error: "Failed to fetch published blogs." },
      { status: 500 },
    );
  }
}
