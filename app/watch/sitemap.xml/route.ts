import { NextResponse } from "next/server";
import { videoStore } from "@/lib/content-store";
import { generateSitemapXML } from "@/lib/sitemap-utils";

const BASE_URL = "https://flavorstudios.in";

export async function GET() {
  try {
    // Fetch all published videos
    const videos = await videoStore.getPublished();

    // Build all <url> entries for published videos (only "published" and with slug)
    const videoPages = Array.isArray(videos)
      ? videos
          .filter((v: any) => v.slug && v.status === "published")
          .map((video: any) => ({
            url: `/watch/${video.slug}`,
            changefreq: "weekly",
            priority: "0.7",
            lastmod: video.updatedAt || video.publishedAt || video.createdAt,
          }))
      : [];

    // Always include the /watch root (even if no videos exist)
    videoPages.unshift({
      url: "/watch",
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date().toISOString(),
    });

    // Generate XML
    const xml = generateSitemapXML(BASE_URL, videoPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Video sitemap generation failed:", error);

    // Fallback: only /watch root
    const fallbackXml = generateSitemapXML(BASE_URL, [
      {
        url: "/watch",
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