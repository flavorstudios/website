import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { generateSitemapXML } from "@/lib/sitemap-utils";

const BASE_URL = "https://flavorstudios.in";

export async function GET() {
  try {
    const blogs = await blogStore.getPublished();

    // Always include /blog root page
    const blogPages =
      Array.isArray(blogs) && blogs.length > 0
        ? blogs
            .filter((b: any) => b.slug)
            .map((blog: any) => ({
              url: `/blog/${blog.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
            }))
        : [];

    // Always include /blog even if no posts exist
    blogPages.unshift({
      url: "/blog",
      changefreq: "weekly",
      priority: "0.5",
      lastmod: new Date().toISOString(),
    });

    const xml = generateSitemapXML(BASE_URL, blogPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    // Fallback: minimal, valid sitemap with only /blog
    const xml = generateSitemapXML(BASE_URL, [
      {
        url: "/blog",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      },
    ]);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}
