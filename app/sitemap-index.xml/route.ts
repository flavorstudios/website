import { type NextRequest, NextResponse } from "next/server"
import { categoryStore } from "@/lib/category-store"

// Hardcode canonical domain for all sitemap entries (never .com)
const BASE_URL = "https://flavorstudios.in"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get all categories for category-specific sitemaps
    const categories = await categoryStore.getAll()

    // Define the sitemaps (main, blog, watch)
    const sitemaps = [
      { url: `${BASE_URL}/sitemap.xml`, lastModified: new Date() },
      { url: `${BASE_URL}/blog/sitemap.xml`, lastModified: new Date() },
      { url: `${BASE_URL}/watch/sitemap.xml`, lastModified: new Date() },
    ]

    // Add category-specific sitemaps (future-proof)
    categories.forEach((category: any) => {
      const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
      sitemaps.push({
        url: `${BASE_URL}/category/${slug}/sitemap.xml`,
        lastModified: new Date(category.updatedAt || category.createdAt || new Date()),
      })
    })

    // Generate XML sitemap index
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastModified.toISOString()}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap index:", error)

    // Basic fallback sitemap index (main sitemap only)
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`

    return new NextResponse(fallbackXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}
