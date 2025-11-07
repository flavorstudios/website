import { NextRequest } from "next/server";
import type { Category } from "@/types/category";
import { handleOptionsRequest } from "@/lib/api/cors";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { logError } from "@/lib/log";

function format(arr: Partial<Category>[], type: "blog" | "video"): Category[] {
  return (arr || [])
    .filter((category) => category.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((category) => ({
      ...category,
      name: category.title,
      type,
      count: category.postCount ?? 0,
      tooltip: category.tooltip ?? undefined,
    })) as Category[];
}

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["GET"] });
}

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);
  try {
    const siteData = await import("@/content-data/categories.json").then(
      (m) => m.default,
    );

    const type = context.request.nextUrl.searchParams.get("type");
    const { blog = [], watch = [] } = siteData.CATEGORIES;

    if (type === "blog") {
      return jsonResponse(context, { categories: format(blog, "blog") });
    }

    if (type === "video") {
      return jsonResponse(context, { categories: format(watch, "video") });
    }

    return jsonResponse(context, {
      blogCategories: format(blog, "blog"),
      videoCategories: format(watch, "video"),
    });
  } catch (error) {
    logError("categories:get", error, { requestId: context.requestId });
    return errorResponse(
      context,
      {
        blogCategories: [],
        videoCategories: [],
        error: "Failed to get categories",
      },
      500,
    );
  }
}
