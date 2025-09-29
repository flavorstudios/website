// app/api/blogs/route.ts

import { type NextRequest, NextResponse } from "next/server";
import {
  blogStore,
  getFallbackBlogPosts,
  isFallbackResult,
} from "@/lib/content-store"; // Firestore-backed store
import { formatPublicBlogSummary } from "@/lib/formatters"; // Summary formatter
import { logBreadcrumb, logError } from "@/lib/log"; // Add error logging
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
    const usingFallback = isFallbackResult(blogs);

    // Only published blogs (same as before)
    let published: BlogPost[] = blogs.filter(
      (b: BlogPost) => b.status === "published",
    );

    // Author filter (supports id or name; also handles author object)
    if (authorParam && authorParam !== "all") {
      const a = authorParam.toLowerCase();
      published = published.filter((b: BlogPost) => {
        const post = b as unknown as {
          authorId?: string;
          author?: string | { id?: string; name?: string };
        };
        const byId =
          typeof post.authorId === "string" &&
          post.authorId.toLowerCase() === a;
        const byName =
          typeof post.author === "string" &&
          post.author.toLowerCase() === a;
        const byObjId =
          typeof post.author === "object" &&
          typeof post.author?.id === "string" &&
          post.author.id.toLowerCase() === a;
        const byObjName =
          typeof post.author === "object" &&
          typeof post.author?.name === "string" &&
          post.author.name.toLowerCase() === a;
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

    // Format for the public API response using summary shape
    const result = await Promise.all(
      published.map((blog) => formatPublicBlogSummary(blog)),
    );

    // Send response with cache headers
    if (usingFallback) {
      logBreadcrumb("api/blogs:GET:fallback-response", {
        reason: "store-fallback",
      });
    }

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

    const fallbackBlogs = getFallbackBlogPosts();
    if (fallbackBlogs.length > 0) {
      logBreadcrumb("api/blogs:GET:fallback-response", {
        reason: "handler-error",
      });
      const publishedFallback = fallbackBlogs.filter(
        (b: BlogPost) => b.status === "published",
      );
      const result = publishedFallback.map(formatPublicBlogSummary);
      const res = NextResponse.json(result);
      res.headers.set("Cache-Control", "public, max-age=300");
      return res;
    }

    // Return a safe error response
    return NextResponse.json(
      { error: "Failed to fetch published blogs." },
      { status: 500 },
    );
  }
}
