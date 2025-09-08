import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { formatPublicBlogDetail } from "@/lib/formatters";
import { logError } from "@/lib/log";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const post = await blogStore.getBySlug(slug);
    if (!post || post.status !== "published") {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const res = NextResponse.json(formatPublicBlogDetail(post));
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    try {
      const requestId = request.headers.get("x-request-id") ?? undefined;
      logError("blogs/[slug]:GET", error, { slug, requestId });
    } catch {
      // ignore logging errors
    }
    return NextResponse.json(
      { error: "Failed to fetch blog post." },
      { status: 500 },
    );
  }
}