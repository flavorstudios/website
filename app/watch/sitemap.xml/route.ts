// app/watch/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { videoStore } from "@/lib/content-store";
import { generateSitemapXML } from "@/lib/sitemap-utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://flavorstudios.in";

interface ContentPage {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    const videos = await videoStore.getPublished();

    // Always include /watch root page
    const videoPages: {
      url: string;
      changefreq: "weekly";
      priority: string;
      lastmod?: string;
    }[] = [
      {
        url: "/watch",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      },
    ];

    // Add published videos if available
    if (Array.isArray(videos) && videos.length > 0) {
      for (const video of videos as ContentPage[]) {
        if (video.slug && video.slug !== "watch") {
          videoPages.push({
            url: `/watch/${video.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: video.updatedAt || video.publishedAt || video.createdAt,
          });
        }
      }
    }

    const xml = generateSitemapXML(BASE_URL, videoPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    // Log error server-side for debugging
    console.error("Video sitemap generation failed:", error);
    // Fallback: minimal, valid sitemap with only /watch
    const xml = generateSitemapXML(BASE_URL, [
      {
        url: "/watch",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      },
    ]);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}