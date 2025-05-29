export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  // Generate robots.txt content
  const robotsTxt = `# Robots.txt for Flavor Studios
User-agent: *
Allow: /

# Disallow admin paths
Disallow: /admin/
Disallow: /api/admin/

# Sitemaps
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/blog/sitemap.xml
Sitemap: ${baseUrl}/watch/sitemap.xml

# Crawl delay
Crawl-delay: 10
`

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
