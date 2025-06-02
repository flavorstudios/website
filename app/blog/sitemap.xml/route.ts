import { NextResponse } from "next/server"
import { generateSitemapXML } from "@/lib/sitemap-utils"

const FALLBACK_BASE_URL = "https://flavorstudios.in"

export async function GET() {
  // Always use .in and strip trailing slash
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "")

  // Fetch dynamic blogs only
  let blogUrls: any[] = []
  try {
    const res = await fetch(`${baseUrl}/api/admin/blogs`, {
      headers: { "Cache-Control": "no-cache" },
    })
    if (res.ok) {
      const data = await res.json()
      blogUrls = (data.blogs || [])
        .filter((blog: any) => blog.slug && blog.published)
        .map((blog: any) => ({
          url: `/blog/${blog.slug}`,
          priority: "0.8",
          changefreq: "weekly",
          lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,

          // Google News data (set isNews: true for news posts)
          news: blog.isNews
            ? {
                publicationName: "Flavor Studios Anime News",
                publicationLanguage: "en",
                title: blog.title,
                publicationDate: blog.publishedAt || blog.createdAt,
              }
            : undefined,

          // Images array (auto-detect structure, adapt if needed)
          images: Array.isArray(blog.images)
            ? blog.images.map((img: any) => ({
                loc: img.url || img.loc, // adapt if your data uses "url" or "loc"
                title: img.title,
                caption: img.caption,
              }))
            : [],
        }))
    }
  } catch (error) {
    console.error("Error generating blog sitemap:", error)
  }

  // Fallback: minimal XML if nothing found
  const xml =
    blogUrls.length > 0
      ? generateSitemapXML(baseUrl, blogUrls)
      : generateSitemapXML(baseUrl, [
          {
            url: "/blog",
            priority: "0.8",
            changefreq: "daily",
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
