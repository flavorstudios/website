// app/watch/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { videoStore } from "@/lib/content-store";
import { generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { getCanonicalUrl } from "@/lib/seo-utils";
import { SITE_URL } from "@/lib/constants";

// Always resolve BASE_URL robustly (env, constants fallback)
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  SITE_URL ||
  "https://flavorstudios.in";

// Canonicalize every SitemapUrl entry for SEO consistency
function toCanonicalSitemapPage(
  page: Omit<SitemapUrl, "url"> & { url: string }
): SitemapUrl {
  return {
    ...page,
    url: getCanonicalUrl(page.url),
  };
}

// Type for video content items
interface ContentPage {
  slug: string;
  status?: "published" | "draft"; // Status is optional for legacy
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    // Defensive: ensure error in .getPublished() doesn't break sitemap
    const videos = await videoStore.getPublished().catch(() => []);

    // Always include the canonical /watch root page
    const videoPages: SitemapUrl[] = [
      toCanonicalSitemapPage({
        url: "/watch",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      }),
    ];

    // Add each published video (with canonical/absolute URL)
    if (Array.isArray(videos) && videos.length > 0) {
      for (const video of videos as ContentPage[]) {
        // Only include if slug is valid, not the root "watch" page,
        // and either has no status (legacy) or is "published"
        if (
          video.slug &&
          video.slug !== "watch" &&
          (!video.status || video.status === "published")
        ) {
          videoPages.push(
            toCanonicalSitemapPage({
              url: `/watch/${video.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: video.updatedAt || video.publishedAt || video.createdAt,
            })
          );
        }
      }
    }

    // Generate the final XML for Google/Bing
    const xml = generateSitemapXML(BASE_URL, videoPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // 1 hour fresh, 1 day stale-while-revalidate
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    // Fallback: minimal valid sitemap if anything fails
    console.error("Video sitemap generation failed:", error);
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      toCanonicalSitemapPage({
        url: "/watch",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: now,
      }),
    ]);
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Shorter max-age for fallback
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }
}
