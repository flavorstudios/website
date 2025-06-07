import { NextResponse } from "next/server"
import { videoStore } from "@/lib/content-store"

const BASE_URL = "https://flavorstudios.in"

export async function GET() {
  try {
    const videos = await videoStore.getPublished()
    const hasEntries = videos && videos.length > 0

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${hasEntries
  ? videos
      .map(
        (video: any) => `  <url>
    <loc>${BASE_URL}/watch/${video.slug || video.id}</loc>
    <lastmod>${new Date(video.updatedAt || video.publishedAt || video.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("\n")
  : ""}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
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
