// app/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { getStaticPages, generateSitemapXML } from "@/lib/sitemap-utils";
import { blogStore, videoStore } from "@/lib/content-store";

const BASE_URL = "https://flavorstudios.in";

export async function GET() {
  try {
    // Fetch published blog and video content
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ]);

    const blogPages = blogs
      .filter((b: any) => b.slug)
      .map((blog: any) => ({
        url: `/blog/${blog.slug}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
      }));

    const videoPages = videos
      .filter((v: any) => v.slug)
      .map((video: any) => ({
        url: `/watch/${video.slug}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod: video.updatedAt || video.publishedAt || video.createdAt,
      }));

    const staticPages = getStaticPages();
    const allPages = [...staticPages, ...blogPages, ...videoPages];

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

    // Fallback: minimal sitemap
    const fallbackXml = generateSitemapXML(BASE_URL, [
      {
        url: "/",
        changefreq: "daily",
        priority: "1.0",
        lastmod: new Date().toISOString(),
      },
      {
        url: "/about",
        changefreq: "monthly",
        priority: "0.8",
        lastmod: new Date().toISOString(),
      },
      {
        url: "/watch",
        changefreq: "daily",
        priority: "0.9",
        lastmod: new Date().toISOString(),
      },
      {
        url: "/blog",
        changefreq: "daily",
        priority: "0.9",
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
