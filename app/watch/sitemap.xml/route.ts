// app/watch/sitemap.xml/route.ts

import { NextResponse } from "next/server";
// import { videoStore } from "@/lib/comment-store"; // No longer needed!
import { generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { SITE_URL } from "@/lib/constants";
import { serverEnv } from "@/env/server";

const BASE_URL =
  serverEnv.NEXT_PUBLIC_BASE_URL ||
  serverEnv.BASE_URL ||
  SITE_URL ||
  "https://flavorstudios.in";

// Use *relative* paths for the sitemap, not canonical URLs!
function toSitemapPage(
  page: Omit<SitemapUrl, "url"> & { url: string }
): SitemapUrl {
  return {
    ...page,
    url: page.url,
  };
}

interface ContentPage {
  slug: string;
  status?: "published" | "draft";
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    // --- Fetch videos via PUBLIC API ---
    const baseUrl = serverEnv.NEXT_PUBLIC_BASE_URL || SITE_URL;
    const videosRes = await fetch(`${baseUrl}/api/videos`);
    const videos: ContentPage[] = videosRes.ok ? await videosRes.json() : [];

    // Always include the root /watch page
    const videoPages: SitemapUrl[] = [
      toSitemapPage({
        url: "/watch",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      }),
    ];

    // Add each published video
    if (Array.isArray(videos) && videos.length > 0) {
      for (const video of videos as ContentPage[]) {
        if (
          video.slug &&
          video.slug !== "watch" &&
          (!video.status || video.status === "published")
        ) {
          videoPages.push(
            toSitemapPage({
              url: `/watch/${video.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: video.updatedAt || video.publishedAt || video.createdAt,
            })
          );
        }
      }
    }

    const xml = generateSitemapXML(BASE_URL, videoPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Video sitemap generation failed:", error);
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/watch", changefreq: "weekly", priority: "0.5", lastmod: now },
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
