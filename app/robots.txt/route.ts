import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

  const robotsTxt = `User-agent: *
Allow: /

# Allow all crawlers to access public content
Allow: /blog
Allow: /watch
Allow: /about
Allow: /contact
Allow: /support
Allow: /career
Allow: /faq
Allow: /legal
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /cookie-policy
Allow: /disclaimer
Allow: /dmca
Allow: /media-usage-policy

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Crawl delay for respectful crawling
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional sitemaps (if needed in the future)
# Sitemap: ${baseUrl}/blog-sitemap.xml
# Sitemap: ${baseUrl}/video-sitemap.xml`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "CDN-Cache-Control": "public, max-age=86400",
      "Vercel-CDN-Cache-Control": "public, max-age=86400",
    },
  })
}
