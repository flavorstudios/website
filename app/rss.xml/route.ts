// app/rss.xml/route.ts

import { NextResponse } from "next/server";
import { generateRssFeed } from "@/lib/rss-utils"; // Correctly imports your RSS generation utility.
import { SITE_NAME } from "@/lib/constants"; // SITE_NAME imported for fallback title.
import { getCanonicalUrl } from "@/lib/seo-utils"; // For canonicalizing fallback URLs.
import { serverEnv } from "@/env/server";
import { isTestMode } from "@/config/flags";

export const revalidate = 3600;

export async function GET() {
  const skipFetch = serverEnv.NODE_ENV === "test" || isTestMode();

  const canonicalSiteUrl = getCanonicalUrl("/");
  const now = new Date().toUTCString();
  const rssMinimal = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title> <description>Anime Creation & Stories</description>
    <link>${canonicalSiteUrl}</link>
    <lastBuildDate>${now}</lastBuildDate>
  </channel>
</rss>`;

  if (skipFetch) {
    return new NextResponse(rssMinimal, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  }

  try {
    // Attempt to generate the full RSS feed.
    const rssXml = await generateRssFeed();
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        // Optimal caching: 1 hour fresh, 1 day stale-while-revalidate.
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400", // ADDED stale-while-revalidate
      },
    });
  } catch (error) {
    console.error("[RSS] Error generating RSS feed (primary attempt):", error);

    // Retry once for resilience in case of transient errors.
    try {
      const rssXml = await generateRssFeed();
      return new NextResponse(rssXml, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          // Shorter cache for retry: 30 min fresh, 1 hour stale-while-revalidate.
          "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600", // ADDED stale-while-revalidate
        },
      });
    } catch (fallbackError) {
      // If all attempts fail, serve the minimal RSS feed.
      console.error("[RSS] Fallback attempt failed:", fallbackError);

      return new NextResponse(rssMinimal, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          // Very short cache for final fallback: 15 min fresh, 30 min stale-while-revalidate.
          "Cache-Control": "public, max-age=900, s-maxage=900, stale-while-revalidate=1800", // ADDED stale-while-revalidate
        },
      });
    }
  }
}
