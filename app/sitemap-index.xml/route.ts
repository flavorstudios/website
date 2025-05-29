import { type NextRequest, NextResponse } from "next/server"
import { categoryStore } from "@/lib/category-store"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

  try {
    // Get all categories to create category-specific sitemaps
    const categories = await categoryStore.getAll()

    // Define the sitemaps
    const sitemaps = [
      { url: `${baseUrl}/sitemap.xml`, lastModified: new Date() },
      { url: `${baseUrl}/blog/sitemap.xml`, lastModified: new Date() },
      { url: `${baseUrl}/watch/sitemap.xml`, lastModified: new Date() },
    ]

    // Add category-specific sitemaps
    categories.forEach((category) => {
      const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
      sitemaps.push({
        url: `${baseUrl}/category/${slug}/sitemap.xml`,
        lastModified: new Date(category.updatedAt || new Date()),
      })
    })

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `
  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastModified.toISOString()}</lastmod>
  </sitemap>
`,
  )
  .join("")}
</sitemapindex>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap index:", error)

    // Return a basic sitemap index if there's an error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
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
