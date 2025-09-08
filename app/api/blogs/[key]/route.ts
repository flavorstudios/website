import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { formatPublicBlogDetail } from "@/lib/formatters";
import { logError } from "@/lib/log";
import { normalizeSlug } from "@/lib/slugify";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  try {
    const normalizedKey = normalizeSlug(key);
    let post = await blogStore.getBySlug(normalizedKey);

    if (!post && (process.env.ACCEPT_ID_FALLBACK || "").toLowerCase() === "true") {
      post = await blogStore.getById(key);
    }

    if (!post || post.status !== "published") {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const res = NextResponse.json(formatPublicBlogDetail(post));
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    try {
      const requestId = request.headers.get("x-request-id") ?? undefined;
      logError("blogs/[key]:GET", error, { key, requestId });
    } catch {
      // ignore logging errors
    }
    return NextResponse.json(
      { error: "Failed to fetch blog post." },
      { status: 500 },
    );
  }
}