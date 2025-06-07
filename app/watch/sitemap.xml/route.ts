import { NextResponse } from "next/server"
import { videoStore } from "@/lib/content-store"

const BASE_URL = "https://flavorstudios.in"

export async function GET() {
  try {
    const videos = await videoStore.getPublished()
    const hasEntries = videos && videos.length > 0

    // Always include at least one <url> entry (for /watch) if empty
    const videoUrls = hasEntries
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
      : `  <url>
    <loc>${BASE_URL}/watch</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${videoUrls}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    // On error, return minimal but valid sitemap with only /watch
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/watch</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    })
  }
}
