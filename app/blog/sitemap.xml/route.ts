import { NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store"

const BASE_URL = "https://flavorstudios.in"

export async function GET() {
  try {
    const blogs = await blogStore.getPublished()
    const hasEntries = blogs && blogs.length > 0

    // Always include at least one <url> entry (for /blog itself) if empty
    const blogUrls = hasEntries
      ? blogs
          .map(
            (blog: any) => `  <url>
    <loc>${BASE_URL}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt || blog.publishedAt || blog.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
          )
          .join("\n")
      : `  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    // On error, return minimal but valid sitemap with only /blog
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    })
  }
}
