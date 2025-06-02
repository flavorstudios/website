import { NextResponse } from "next/server"
import { generateSitemapXML } from "@/lib/sitemap-utils"

const FALLBACK_BASE_URL = "https://flavorstudios.in"

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "")
  let videoUrls: any[] = []

  try {
    const res = await fetch(`${baseUrl}/api/admin/videos`, {
      headers: { "Cache-Control": "no-cache" },
    })
    if (res.ok) {
      const data = await res.json()
      videoUrls = (data.videos || [])
        .filter((video: any) => video.slug && video.published)
        .map((video: any) => ({
          url: `/watch/${video.slug}`,
          priority: "0.8",
          changefreq: "weekly",
          lastmod: video.updatedAt || video.publishedAt || video.createdAt,
        }))
    }
  } catch (error) {
    console.error("Error generating watch sitemap:", error)
  }

  const xml =
    videoUrls.length > 0
      ? generateSitemapXML(baseUrl, videoUrls)
      : generateSitemapXML(baseUrl, [
          {
            url: "/watch",
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
