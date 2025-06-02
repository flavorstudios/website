import { NextResponse } from "next/server"
import { generateSitemapXML } from "@/lib/sitemap-utils"

const FALLBACK_BASE_URL = "https://flavorstudios.in"

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "")
  const { slug } = params

  let blogData: any = null

  try {
    // Fetch single blog by slug
    const res = await fetch(`${baseUrl}/api/admin/blogs/${slug}`, {
      headers: { "Cache-Control": "no-cache" },
    })
    if (res.ok) {
      const data = await res.json()
      blogData = data.blog || null
    }
  } catch (error) {
    console.error("Error generating single blog sitemap:", error)
  }

  // Only create if the blog exists and is published
  const xml =
    blogData && blogData.published
      ? generateSitemapXML(baseUrl, [
          {
            url: `/blog/${blogData.slug}`,
            priority: "0.8",
            changefreq: "weekly",
            lastmod: blogData.updatedAt || blogData.publishedAt || blogData.createdAt,

            // Google News support
            news: blogData.isNews
              ? {
                  publicationName: "Flavor Studios Anime News",
                  publicationLanguage: blogData.language || "en",
                  title: blogData.title,
                  publicationDate: blogData.publishedAt || blogData.createdAt,
                }
              : undefined,

            // Image support, with robust filtering
            images: Array.isArray(blogData.images)
              ? blogData.images
                  .filter((img: any) => img && (img.url || img.loc))
                  .map((img: any) => ({
                    loc: img.url || img.loc,
                    title: img.title,
                    caption: img.caption,
                  }))
              : [],
          },
        ])
      : generateSitemapXML(baseUrl, [
          {
            url: `/blog/${slug}`,
            priority: "0.1",
            changefreq: "never",
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
