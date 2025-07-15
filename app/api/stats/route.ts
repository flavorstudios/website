import { NextResponse } from "next/server";
import { blogStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const blogs = await blogStore.getAll();
    const published = blogs.filter((b: any) => b.status === "published");
    const result = published.map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      category: blog.category,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
      readTime: blog.readTime,
      views: blog.views,
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
    }));
    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    console.error("Failed to fetch published blogs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
