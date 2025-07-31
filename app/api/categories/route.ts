// app/api/categories/route.ts

import { NextResponse, type NextRequest } from "next/server";
import type { Category } from "@/types/category";

// Helper to format categories (adds name & type fields)
function format(arr: Partial<Category>[], type: "blog" | "video"): Category[] {
  return (arr || [])
    .filter((c) => c.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => ({
      ...c,
      name: c.title, // For compatibility/UI
      type,          // Now fulfills Category type!
      count: c.postCount ?? 0,
      tooltip: c.tooltip ?? undefined,
    })) as Category[];
}

export async function GET(request: NextRequest) {
  try {
    // Dynamic import: for Next.js API route compatibility!
    const siteData = await import('@/content-data/categories.json').then(m => m.default);

    const type = request.nextUrl.searchParams.get("type");
    const { blog = [], watch = [] } = siteData.CATEGORIES;

    if (type === "blog") {
      const response = NextResponse.json({
        categories: format(blog, "blog"),
      });
      response.headers.set("Cache-Control", "public, max-age=300");
      return response;
    }

    if (type === "video") {
      const response = NextResponse.json({
        categories: format(watch, "video"),
      });
      response.headers.set("Cache-Control", "public, max-age=300");
      return response;
    }

    // No type: return both blog and video categories
    const response = NextResponse.json({
      blogCategories: format(blog, "blog"),
      videoCategories: format(watch, "video"),
    });
    response.headers.set("Cache-Control", "public, max-age=300");
    return response;
  } catch (error) {
    console.error("Failed to get categories:", error);
    return NextResponse.json(
      {
        blogCategories: [],
        videoCategories: [],
        error: "Failed to get categories",
      },
      { status: 500 }
    );
  }
}
