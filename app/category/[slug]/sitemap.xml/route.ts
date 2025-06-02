import { NextResponse } from "next/server"
import { generateSitemapXML } from "@/lib/sitemap-utils"

const FALLBACK_BASE_URL = "https://flavorstudios.in"

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "")
  const { slug } = params

  let urls: any[] = []

  try {
    // Fetch blogs for this category
    const res = await fetch(`${baseUrl}/api/admin/blogs?category=${slug}`, {
      headers: { "Cache-Control": "no-cache" },
    })
    if (res.ok) {
      const data = await res.json()
      urls = (data.blogs || [])
        .filter((blog: any) => blog.slug && blog.published)
        .map((blog: any) => ({
          url: `/blog/${blog.slug}`,
          priority: "0.7",
          changefreq: "weekly",
          lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
        }))
    }
  } catch (error) {
    console.error("Error generating category sitemap:", error)
  }

  // If nothing, provide category index
  const xml =
    urls.length > 0
      ? generateSitemapXML(baseUrl, urls)
      : generateSitemapXML(baseUrl, [
          {
            url: `/blog?category=${slug}`,
            priority: "0.6",
            changefreq: "weekly",
            lastmod: new Date().toISOString(),
          },
        ])

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
