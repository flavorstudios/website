import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"

  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Disallow temporary or test pages
Disallow: /test/
Disallow: /temp/

# Allow important pages
Allow: /
Allow: /about
Allow: /watch
Allow: /blog
Allow: /contact
Allow: /faq
Allow: /career
Allow: /support
Allow: /play

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml

# RSS Feed
Sitemap: ${baseUrl}/rss.xml

# Crawl delay (optional)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
