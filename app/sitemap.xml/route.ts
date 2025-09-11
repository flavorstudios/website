// app/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { getStaticPages, generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
// import { blogStore, videoStore } from "@/lib/comment-store"; // No longer needed!
import { SITE_URL } from "@/lib/constants";
import { serverEnv } from "@/env/server";

// Prefer env variable, fallback to SITE_URL or the default
const BASE_URL =
  serverEnv.NEXT_PUBLIC_BASE_URL ||
  serverEnv.BASE_URL ||
  SITE_URL ||
  "https://flavorstudios.in";

// No more canonicalization here; just return as-is
function toSitemapPage(page: Omit<SitemapUrl, "url"> & { url: string }): SitemapUrl {
  return { ...page, url: page.url };
}

interface ContentPage {
  slug: string;
  status: "published" | "draft";
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export const revalidate = 3600;

export async function GET() {
  try {
    // --- Fetch published blogs and videos via PUBLIC API ---
    const skipFetch =
      serverEnv.NODE_ENV === "test" || serverEnv.TEST_MODE === "true";
    let blogs: ContentPage[] = [];
    let videos: ContentPage[] = [];
    
    if (!skipFetch) {
      try {
        const res = await fetch(`${BASE_URL}/api/blogs`, {
          next: { tags: ["feeds"], revalidate: 3600 },
        });
        if (res.ok) {
          blogs = await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch blogs for sitemap:", err);
      }
    try {
        const res = await fetch(`${BASE_URL}/api/videos`, {
          next: { tags: ["feeds"], revalidate: 3600 },
        });
        if (res.ok) {
          videos = await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch videos for sitemap:", err);
      }
    }

    // Blogs (relative URLs only!)
    const blogPages: SitemapUrl[] = (blogs as ContentPage[])
      .filter((b) => b.slug && b.status === "published")
      .map((blog) =>
        toSitemapPage({
          url: `/blog/${blog.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
        })
      );

    // Videos (relative URLs only!)
    const videoPages: SitemapUrl[] = (videos as ContentPage[])
      .filter((v) => v.slug && v.status === "published")
      .map((video) =>
        toSitemapPage({
          url: `/watch/${video.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: video.updatedAt || video.publishedAt || video.createdAt,
        })
      );

    // Static pages (all relative URLs)
    const staticPages: SitemapUrl[] = getStaticPages().map(toSitemapPage);

    // Deduplicate URLs (by relative path)
    const seen = new Set<string>();
    const allPages: SitemapUrl[] = [...staticPages, ...blogPages, ...videoPages].filter((page) => {
      if (seen.has(page.url)) return false;
      seen.add(page.url);
      return true;
    });

    // Generate XML using robust joinUrl logic inside generateSitemapXML
    const xml = generateSitemapXML(BASE_URL, allPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/", changefreq: "daily", priority: "1.0", lastmod: now },
      { url: "/about", changefreq: "monthly", priority: "0.8", lastmod: now },
      { url: "/watch", changefreq: "daily", priority: "0.9", lastmod: now },
      { url: "/blog", changefreq: "daily", priority: "0.9", lastmod: now },
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
