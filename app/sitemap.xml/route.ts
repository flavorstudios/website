// app/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { getStaticPages, generateSitemapXML } from "@/lib/sitemap-utils";
import { blogStore, videoStore } from "@/lib/content-store";

const BASE_URL = "https://flavorstudios.in";

export async function GET() {
  try {
    // Fetch all published blogs and videos
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ]);

    // Blog pages (only published and valid slugs)
    const blogPages = blogs
      .filter((b: any) => b.slug && b.status === "published")
      .map((blog: any) => ({
        url: `/blog/${blog.slug}`,
        changefreq: "weekly",
        priority: "0.7",
        lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
      }));

    // Video pages (only published and valid slugs)
    const videoPages = videos
      .filter((v: any) => v.slug && v.status === "published")
      .map((video: any) => ({
        url: `/watch/${video.slug}`,
        changefreq: "weekly",
        priority: "0.7",
        lastmod: video.updatedAt || video.publishedAt || video.createdAt,
      }));

    // Static pages (centralized in lib/sitemap-utils)
    const staticPages = getStaticPages();

    // Merge all sitemap entries
    const allPages = [...staticPages, ...blogPages, ...videoPages];

    // Generate XML
    const xml = generateSitemapXML(BASE_URL, allPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error);

    // Fallback: Only home, about, watch, blog
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/", changefreq: "daily", priority: "1.0", lastmod: new Date().toISOString() },
      { url: "/about", changefreq: "monthly", priority: "0.8", lastmod: new Date().toISOString() },
      { url: "/watch", changefreq: "daily", priority: "0.9", lastmod: new Date().toISOString() },
      { url: "/blog", changefreq: "daily", priority: "0.9", lastmod: new Date().toISOString() },
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