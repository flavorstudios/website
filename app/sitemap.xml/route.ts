// app/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { getStaticPages, generateSitemapXML } from "@/lib/sitemap-utils";
import { blogStore, videoStore } from "@/lib/content-store";

// Load BASE_URL from .env or fallback
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://flavorstudios.in";

// Generic interface for your content
interface ContentPage {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    // Fetch published blog and video content in parallel
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ]);

    // Blog pages
    const blogPages = (blogs as ContentPage[])
      .filter(b => b.slug)
      .map(blog => ({
        url: `/blog/${blog.slug}`,
        changefreq: "weekly" as const,
        priority: "0.8",
        lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
      }));

    // Video pages
    const videoPages = (videos as ContentPage[])
      .filter(v => v.slug)
      .map(video => ({
        url: `/watch/${video.slug}`,
        changefreq: "weekly" as const,
        priority: "0.8",
        lastmod: video.updatedAt || video.publishedAt || video.createdAt,
      }));

    // Static pages
    const staticPages = getStaticPages();

    // Deduplicate (just in case—based on `url`)
    const seen = new Set<string>();
    const allPages = [...staticPages, ...blogPages, ...videoPages].filter(page => {
      if (seen.has(page.url)) return false;
      seen.add(page.url);
      return true;
    });

    // Generate the XML
    const xml = generateSitemapXML(BASE_URL, allPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Optimal caching: 1h fresh, up to 1d stale (customize if you wish)
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error);

    // Fallback: minimal sitemap with home + key pages
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
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }
}