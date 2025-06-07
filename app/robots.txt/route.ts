import { NextResponse } from "next/server"

export async function GET() {
  // Always use the canonical .in domain for SEO consistency
  const baseUrl = "https://flavorstudios.in"

  const robotsTxt = `
User-agent: *
Allow: /

# Disallow admin, API, and test/dev pages
Disallow: /admin/
Disallow: /api/
Disallow: /test/
Disallow: /temp/

# Allow all main public pages (redundant with Allow: /, but explicit for clarity)
Allow: /about
Allow: /watch
Allow: /blog
Allow: /contact
Allow: /faq
Allow: /career
Allow: /support
Allow: /play

# Sitemap locations (all .in, no .com, auto-updating sitemaps)
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/blog/sitemap.xml
Sitemap: ${baseUrl}/watch/sitemap.xml

# RSS Feed
Sitemap: ${baseUrl}/rss.xml

# Explicitly block crawling of query parameters & search (optional, industry best-practice)
Disallow: /*?
Disallow: /*search=

# Crawl-delay for less server strain (optional, Google ignores, but some bots respect)
Crawl-delay: 1

# Industry-standard: No indexing of non-production environments (if you ever add, like, staging.)
# Uncomment if needed:
# User-agent: *
# Disallow: /

# End of robots.txt
`.trim()

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
