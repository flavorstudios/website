import { NextResponse } from "next/server";
import { generateRssFeed } from "@/lib/rss-utils";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  try {
    // Primary attempt to generate the RSS feed
    const rssXml = await generateRssFeed();
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[RSS] Error generating RSS feed (primary attempt):", error);

    // Use the utility's fallback logic, which will return a minimal valid feed
    try {
      const rssXml = await generateRssFeed();
      return new NextResponse(rssXml, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=1800",
        },
      });
    } catch (fallbackError) {
      // If fallback fails, return the minimal feed with the domain replaced by SITE_URL
      console.error("[RSS] Fallback attempt failed:", fallbackError);

      // Use the SITE_URL constant in the minimal RSS feed to avoid hardcoding the domain
      const rssMinimal = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_URL}</title>
    <description>Anime Creation & Stories</description>
    <link>${SITE_URL}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

      return new NextResponse(rssMinimal, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=900, s-maxage=900",
        },
      });
    }
  }
}
