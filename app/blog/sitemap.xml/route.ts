import { NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store"

// Canonical domain
const BASE_URL = "https://flavorstudios.in"

export async function GET() {
  try {
    const blogs = await blogStore.getPublished()

    const blogPages = blogs.map((blog: any) => ({
      url: `/blog/${blog.slug}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date(blog.updatedAt || blog.publishedAt || blog.createdAt).toISOString(),
    }))

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating blog sitemap:", error)
    // Fallback empty sitemap
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=1800, s-maxage=1800",
        },
      }
    )
  }
}
