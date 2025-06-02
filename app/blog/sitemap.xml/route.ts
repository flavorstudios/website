import { NextResponse } from "next/server"
import { generateSitemapXML } from "@/lib/sitemap-utils"

const FALLBACK_BASE_URL = "https://flavorstudios.in"

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "")

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

          news: blog.isNews
            ? {
                publicationName: "Flavor Studios Anime News",
                publicationLanguage: blog.language || "en",
                title: blog.title,
                publicationDate: blog.publishedAt || blog.createdAt,
              }
            : undefined,

          images: Array.isArray(blog.images)
            ? blog.images
                .filter((img: any) => img && (img.url || img.loc))
                .map((img: any) => ({
                  loc: img.url || img.loc,
                  title: img.title,
                  caption: img.caption,
                }))
            : [],
        }))
    }
  } catch (error) {
    console.error("Error generating blog sitemap:", error)
  }

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
