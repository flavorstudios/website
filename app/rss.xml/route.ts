import { NextResponse } from "next/server";
import { generateRssFeed } from "@/lib/rss-utils";

export async function GET() {
  try {
    const rssXml = await generateRssFeed();
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[RSS] Error generating RSS feed (primary attempt):", error);
    // Fully DRY: Use the utility's own fallback logic, which returns a minimal valid feed
    try {
      const rssXml = await generateRssFeed();
      return new NextResponse(rssXml, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=1800",
        },
      });
    } catch (fallbackError) {
      // If even the fallback fails, log and serve a last-resort minimal RSS string (extremely rare)
      console.error("[RSS] Fallback attempt failed:", fallbackError);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in";
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Flavor Studios</title>
    <description>Anime Creation & Stories</description>
    <link>${baseUrl}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=900, s-maxage=900",
        },
      });
    }
  }
}
