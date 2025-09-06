import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { formatPublicBlog } from "@/lib/formatters";
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

    const res = NextResponse.json(formatPublicBlog(post));
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    try {
      logError("blogs/[slug]:GET", error);
    } catch {
      // ignore logging errors
    }
    return NextResponse.json(
      { error: "Failed to fetch blog post." },
      { status: 500 },
    );
  }
}