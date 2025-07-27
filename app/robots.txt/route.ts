// app/robots.txt/route.ts

import { NextResponse } from "next/server";
import { getCanonicalUrl } from "@/lib/seo-utils";

// This route dynamically generates robots.txt for your site.
export async function GET(): Promise<NextResponse> {
  // Get canonical sitemap index URL
  const sitemapIndexUrl = getCanonicalUrl("/sitemap.xml");

  // Is this a production environment?
  const isProduction = process.env.NODE_ENV === "production";

  // In production: Allow all except /cdn-cgi/
  // In dev/staging: Disallow everything
  const robotsTxt = isProduction
    ? `User-agent: *
Disallow: /cdn-cgi/

Sitemap: ${sitemapIndexUrl}
`
    : `User-agent: *
Disallow: /

Sitemap: ${sitemapIndexUrl}
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
