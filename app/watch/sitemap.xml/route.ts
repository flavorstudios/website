import { NextResponse } from "next/server";
import { videoStore } from "@/lib/content-store";
import { generateSitemapXML } from "@/lib/sitemap-utils";

const BASE_URL = "https://flavorstudios.in";

export async function GET() {
  try {
    const videos = await videoStore.getPublished();

    // Always include /watch root page
    const videoPages =
      Array.isArray(videos) && videos.length > 0
        ? videos
            .filter((v: any) => v.slug)
            .map((video: any) => ({
              url: `/watch/${video.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: video.updatedAt || video.publishedAt || video.createdAt,
            }))
        : [];

    // Always include /watch even if no videos exist
    videoPages.unshift({
      url: "/watch",
      changefreq: "weekly",
      priority: "0.5",
      lastmod: new Date().toISOString(),
    });

    const xml = generateSitemapXML(BASE_URL, videoPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
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
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}
