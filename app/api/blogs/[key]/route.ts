import { NextResponse } from "next/server";
import {
  blogStore,
  getFallbackBlogPostById,
  getFallbackBlogPostBySlug,
  isFallbackResult,
} from "@/lib/content-store";
import { formatPublicBlogDetail } from "@/lib/formatters";
import { logBreadcrumb, logError } from "@/lib/log";
import { normalizeSlug } from "@/lib/slugify";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  let normalizedKey: string | null = null;
  try {
    normalizedKey = normalizeSlug(key);

    if (!normalizedKey) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    
    let post = await blogStore.getBySlug(normalizedKey);
    let usedFallback = isFallbackResult(post);

    if (!post && (process.env.ACCEPT_ID_FALLBACK || "").toLowerCase() === "true") {
      post = await blogStore.getById(key);
      usedFallback = usedFallback || isFallbackResult(post);
    }

    if (!post || post.status !== "published") {
      if (usedFallback) {
        logBreadcrumb("api/blogs/[key]:GET:fallback-response", {
          reason: "store-fallback-not-published",
          key: normalizedKey,
        });
      }
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (usedFallback) {
      logBreadcrumb("api/blogs/[key]:GET:fallback-response", {
        reason: "store-fallback",
        key: normalizedKey,
      });
    }

    const formatted = await formatPublicBlogDetail(post);
    const res = NextResponse.json(formatted);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    try {
      const requestId = request.headers.get("x-request-id") ?? undefined;
      logError("blogs/[key]:GET", error, { key, requestId });
    } catch {
      // ignore logging errors
    }
    const fallbackViaSlug = normalizedKey
      ? getFallbackBlogPostBySlug(normalizedKey)
      : null;
    const allowIdFallback = (process.env.ACCEPT_ID_FALLBACK || "").toLowerCase() === "true";
    const fallbackViaId = allowIdFallback ? getFallbackBlogPostById(key) : null;
    const fallback = fallbackViaSlug ?? fallbackViaId;

    if (fallback && fallback.status === "published") {
      logBreadcrumb("api/blogs/[key]:GET:fallback-response", {
        reason: "handler-error",
        key: normalizedKey,
      });
      const res = NextResponse.json(formatPublicBlogDetail(fallback));
      res.headers.set("Cache-Control", "public, max-age=300");
      return res;
    }

    if (!fallback) {
      logBreadcrumb("api/blogs/[key]:GET:fallback-response", {
        reason: "handler-error-no-fallback",
        key: normalizedKey,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch blog post." },
      { status: fallback ? 404 : 500 },
    );
  }
}