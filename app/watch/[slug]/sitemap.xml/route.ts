import { NextResponse } from "next/server"
import { generateSitemapXML } from "@/lib/sitemap-utils"

const FALLBACK_BASE_URL = "https://flavorstudios.in"

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "")
  const { slug } = params

  let videoData: any = null

  try {
    // Fetch single video by slug
    const res = await fetch(`${baseUrl}/api/admin/videos/${slug}`, {
      headers: { "Cache-Control": "no-cache" },
    })
    if (res.ok) {
      const data = await res.json()
      videoData = data.video || null
    }
  } catch (error) {
    console.error("Error generating single video sitemap:", error)
  }

  // Only create if the video exists and is published
  const xml =
    videoData && videoData.published
      ? generateSitemapXML(baseUrl, [
          {
            url: `/watch/${videoData.slug}`,
            priority: "0.8",
            changefreq: "weekly",
            lastmod: videoData.updatedAt || videoData.publishedAt || videoData.createdAt,

            // Video sitemap support
            video: videoData.youtubeUrl
              ? {
                  title: videoData.title,
                  description: videoData.description || videoData.title,
                  content_loc: videoData.youtubeUrl,
                  thumbnail_loc: videoData.thumbnailUrl,
                  publication_date: videoData.publishedAt || videoData.createdAt,
                  duration: videoData.duration, // seconds, optional
                }
              : undefined,

            // Image support for thumbnail
            images: videoData.thumbnailUrl
              ? [
                  {
                    loc: videoData.thumbnailUrl,
                    title: videoData.title,
                  },
                ]
              : [],
          },
        ])
      : generateSitemapXML(baseUrl, [
          {
            url: `/watch/${slug}`,
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
