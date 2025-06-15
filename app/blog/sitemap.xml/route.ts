import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { generateSitemapXML } from "@/lib/sitemap-utils";

const BASE_URL = "https://flavorstudios.in";

export async function GET() {
  try {
    // Fetch all published blog posts
    const blogs = await blogStore.getPublished();

    // Build all <url> entries for the blog
    const blogPages = Array.isArray(blogs)
      ? blogs
          .filter((b: any) => b.slug && b.status === "published")
          .map((blog: any) => ({
            url: `/blog/${blog.slug}`,
            changefreq: "weekly",
            priority: "0.7",
            lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
          }))
      : [];

    // Always include the /blog root, even if there are no posts
    blogPages.unshift({
      url: "/blog",
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date().toISOString(),
    });

    // Generate XML
    const xml = generateSitemapXML(BASE_URL, blogPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Blog sitemap generation failed:", error);

    // Fallback: Just the /blog root
    const fallbackXml = generateSitemapXML(BASE_URL, [
      {
        url: "/blog",
        changefreq: "weekly",
        priority: "0.8",
        lastmod: new Date().toISOString(),
      },
    ]);

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}