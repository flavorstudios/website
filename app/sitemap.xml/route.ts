// app/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { getStaticPages, generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { blogStore, videoStore } from "@/lib/content-store";
import { getCanonicalUrl } from "@/lib/seo-utils";
import { SITE_URL } from "@/lib/constants";

// Always prefer environment variable but fall back for robustness
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  SITE_URL ||
  "https://flavorstudios.in";

// Canonicalizes a SitemapUrl using getCanonicalUrl
function toCanonicalSitemapPage(
  page: Omit<SitemapUrl, "url"> & { url: string }
): SitemapUrl {
  return {
    ...page,
    url: getCanonicalUrl(page.url),
  };
}

// Interface for typed content from stores
interface ContentPage {
  slug: string;
  status: "published" | "draft";
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    // Parallel fetching for blog and video content (published only)
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ]);

    // Blogs
    const blogPages: SitemapUrl[] = (blogs as ContentPage[])
      .filter((b) => b.slug && b.status === "published")
      .map((blog) =>
        toCanonicalSitemapPage({
          url: `/blog/${blog.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
        })
      );

    // Videos
    const videoPages: SitemapUrl[] = (videos as ContentPage[])
      .filter((v) => v.slug && v.status === "published")
      .map((video) =>
        toCanonicalSitemapPage({
          url: `/watch/${video.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: video.updatedAt || video.publishedAt || video.createdAt,
        })
      );

    // Static pages (canonicalized)
    const staticPages: SitemapUrl[] = getStaticPages().map(toCanonicalSitemapPage);

    // Deduplicate URLs (unique by canonical url)
    const seen = new Set<string>();
    const allPages: SitemapUrl[] = [...staticPages, ...blogPages, ...videoPages].filter((page) => {
      if (seen.has(page.url)) return false;
      seen.add(page.url);
      return true;
    });

    // Generate XML
    const xml = generateSitemapXML(BASE_URL, allPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    // Fallback in case of critical failure
    console.error("Sitemap generation failed:", error);

    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      toCanonicalSitemapPage({
        url: "/",
        changefreq: "daily",
        priority: "1.0",
        lastmod: now,
      }),
      toCanonicalSitemapPage({
        url: "/about",
        changefreq: "monthly",
        priority: "0.8",
        lastmod: now,
      }),
      toCanonicalSitemapPage({
        url: "/watch",
        changefreq: "daily",
        priority: "0.9",
        lastmod: now,
      }),
      toCanonicalSitemapPage({
        url: "/blog",
        changefreq: "daily",
        priority: "0.9",
        lastmod: now,
      }),
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
