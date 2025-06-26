// app/robots.txt/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCanonicalUrl } from "@/lib/seo-utils";
import { SITE_URL } from "@/lib/constants";

// This route dynamically generates robots.txt for your site.
export async function GET(_request: NextRequest): Promise<NextResponse> {
  // Always resolve the canonical sitemap index dynamically.
  // This ensures search engines can find all your content.
  const sitemapIndexUrl = getCanonicalUrl("/sitemap.xml");

  // Determine if the current environment is production.
  // This allows for different crawling rules based on the deployment environment.
  const isProduction = process.env.NODE_ENV === "production";

  // Construct the robots.txt content.
  // In production, generally allow all crawling.
  // In non-production environments (development, staging), disallow all crawling
  // to prevent accidental indexing of incomplete or private versions of the site.
  // An extra newline is added after the Allow/Disallow line for formatting.
  const robotsTxt = `User-agent: *
${isProduction ? "Allow: /" : "Disallow: /"}

Sitemap: ${sitemapIndexUrl}
`;

  return new NextResponse(robotsTxt, {
    status: 200, // HTTP 200 OK status indicates the robots.txt file exists and is accessible.
    headers: {
      "Content-Type": "text/plain; charset=utf-8", // Crucial: robots.txt must be served as plain text.
      // Optimal Cache-Control for robots.txt:
      // public: cacheable by any cache.
      // max-age/s-maxage: cache for 1 day (86400 seconds).
      // stale-while-revalidate: allows serving stale content for 1 day if new content is being fetched in background.
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
