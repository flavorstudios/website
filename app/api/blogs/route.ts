import { NextRequest } from "next/server";
import {
  blogStore,
  getFallbackBlogPosts,
  isFallbackResult,
BlogPost,
} from "@/lib/content-store";
import { formatPublicBlogSummary } from "@/lib/formatters";
import { logBreadcrumb, logError } from "@/lib/log";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { handleOptionsRequest } from "@/lib/api/cors";

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["GET"] });
}

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);

  try {
    const { searchParams } = request.nextUrl;
    const authorParam = searchParams.get("author");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = parseDate(startDateParam);
    const endDateRaw = parseDate(endDateParam);
    const endDate = endDateRaw
      ? new Date(new Date(endDateRaw).setHours(23, 59, 59, 999))
      : null;

    const blogs = await blogStore.getAll();
    const usingFallback = isFallbackResult(blogs);

    let published: BlogPost[] = blogs.filter(
      (blog: BlogPost) => blog.status === "published",
    );

    if (authorParam && authorParam !== "all") {
      const normalized = authorParam.toLowerCase();
      published = published.filter((post: BlogPost) => {
        const potential = post as unknown as {
          authorId?: string;
          author?: string | { id?: string; name?: string };
        };
        const byId =
          typeof potential.authorId === "string" &&
          potential.authorId.toLowerCase() === normalized;
        const byName =
          typeof potential.author === "string" &&
          potential.author.toLowerCase() === normalized;
        const byObjId =
          typeof potential.author === "object" &&
          typeof potential.author?.id === "string" &&
          potential.author.id.toLowerCase() === normalized;
        const byObjName =
          typeof potential.author === "object" &&
          typeof potential.author?.name === "string" &&
          potential.author.name.toLowerCase() === normalized;
        return byId || byName || byObjId || byObjName;
      });
    }

    if (startDate) {
      published = published.filter(
        (post: BlogPost) => post.publishedAt && new Date(post.publishedAt) >= startDate,
      );
    }
    if (endDate) {
      published = published.filter(
        (post: BlogPost) => post.publishedAt && new Date(post.publishedAt) <= endDate,
      );
    }

    const result = await Promise.all(
      published.map((blog) => formatPublicBlogSummary(blog)),
    );

    if (usingFallback) {
      logBreadcrumb("api/blogs:get:fallback", {
        requestId: context.requestId,
        reason: "store-fallback",
      });
    }

    return jsonResponse(context, result);
  } catch (error) {
    logError("blogs:get", error, { requestId: context.requestId });

    const fallbackBlogs = getFallbackBlogPosts();
    if (fallbackBlogs.length > 0) {
      logBreadcrumb("api/blogs:get:fallback", {
        requestId: context.requestId,
        reason: "handler-error",
      });
      const publishedFallback = fallbackBlogs.filter(
        (blog: BlogPost) => blog.status === "published",
      );
      const result = await Promise.all(
        publishedFallback.map((blog) => formatPublicBlogSummary(blog)),
      );
      return jsonResponse(context, result);
    }

    return errorResponse(
      context,
      { error: "Failed to fetch published blogs." },
      500,
    );
  }
}
