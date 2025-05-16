import { getAllPostSlugs } from "@/lib/posts"
import { getAllEpisodeSlugs } from "@/lib/episodes"

export async function GET() {
  const baseUrl = "https://flavorstudios.in"

  // Define static routes
  const staticPaths = [
    "/",
    "/about",
    "/blog",
    "/watch",
    "/play",
    "/support",
    "/contact",
    "/career",
    "/faq",
    "/privacy-policy",
    "/terms-of-service",
    "/dmca",
    "/cookie-policy",
    "/disclaimer",
    "/media-usage-policy",
  ]

  // Get dynamic routes
  const postSlugs = await getAllPostSlugs()
  const episodeSlugs = await getAllEpisodeSlugs()

  // Create full URLs for all routes
  const staticUrls = staticPaths.map((path) => `${baseUrl}${path}`)
  const blogUrls = postSlugs.map((slug) => `${baseUrl}/blog/${slug}`)
  const watchUrls = episodeSlugs.map((slug) => `${baseUrl}/watch/${slug}`)

  // Combine all URLs
  const allUrls = [...staticUrls, ...blogUrls, ...watchUrls]

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  // Return the XML response
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
