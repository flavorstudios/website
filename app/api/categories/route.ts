// app/api/categories/route.ts

import { NextResponse, type NextRequest } from "next/server";
import siteData from "@/content-data/categories.json";

function format(arr: any[]) {
  return (arr || [])
    .filter((c) => c.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => ({
      ...c,
      name: c.title, // Provide "name" for compatibility, but all original fields included
      count: c.postCount ?? 0,
      tooltip: c.tooltip ?? undefined,
    }));
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");
    const { blog = [], watch = [] } = siteData.CATEGORIES;

    if (type === "blog") {
      const response = NextResponse.json({
        categories: format(blog),
      });
      response.headers.set("Cache-Control", "public, max-age=300");
      return response;
    }

    if (type === "video") {
      const response = NextResponse.json({
        categories: format(watch),
      });
      response.headers.set("Cache-Control", "public, max-age=300");
      return response;
    }

    // If no type, return both blog and video categories
    const response = NextResponse.json({
      blogCategories: format(blog),
      videoCategories: format(watch),
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
