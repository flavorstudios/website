import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"

// XML attribute escape for URLs
function escapeAttr(unsafe: string) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}
function truncateDescription(text: string, maxLength = 200): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

    // Fetch all published blogs and videos
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Helper to add enclosures (image/audio/video) to each item
    function getEnclosures(item: any): string {
      let enclosures = ""

      // Images (RSS best practice: use main thumbnail)
      if (item.thumbnail || item.image || item.coverImage) {
        const imgUrl = item.thumbnail || item.image || item.coverImage
        enclosures += `<enclosure url="${escapeAttr(imgUrl)}" type="image/jpeg" length="0"/>`
      }
      // Audio (for podcasts)
      if (item.audioUrl) {
        enclosures += `<enclosure url="${escapeAttr(item.audioUrl)}" type="audio/mpeg" length="0"/>`
      }
      // Video (mp4 or YouTube direct)
      if (item.videoUrl || item.youtubeUrl) {
        const url = item.videoUrl || item.youtubeUrl
        const type = item.videoUrl ? "video/mp4" : "video/*"
        enclosures += `<enclosure url="${escapeAttr(url)}" type="${type}" length="0"/>`
      }
      return enclosures
    }

    // Merge and sort by newest date
    const allContent = [
      ...blogs.map((blog: any) => ({
        title: blog.title,
        description: truncateDescription(stripHtml(blog.excerpt || blog.seoDescription || blog.content || "")),
        link: `${baseUrl}/blog/${blog.slug}`,
        pubDate: new Date(blog.publishedAt).toUTCString(),
        categories: (blog.tags || [blog.category]).filter(Boolean), // support tags AND category
        author: blog.author || "Flavor Studios",
        enclosures: getEnclosures(blog),
      })),
      ...videos.map((video: any) => ({
        title: video.title,
        description: truncateDescription(stripHtml(video.description || "")),
        link: `${baseUrl}/watch/${video.slug || video.id}`,
        pubDate: new Date(video.publishedAt).toUTCString(),
        categories: (video.tags || [video.category]).filter(Boolean),
        author: "Flavor Studios",
        enclosures: getEnclosures(video),
      })),
    ]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 50)

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>Flavor Studios - Anime Creation & Stories</title>
    <description>Latest anime episodes, behind-the-scenes content, and creative insights from Flavor Studios</description>
    <link>${baseUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/placeholder.svg?height=144&width=144&text=Flavor+Studios</url>
      <title>Flavor Studios</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
${allContent
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      ${item.categories.map((cat: string) => `<category><![CDATA[${cat}]]></category>`).join("\n      ")}
      <author><![CDATA[${item.author}]]></author>
      <dc:creator><![CDATA[${item.author}]]></dc:creator>
      <guid isPermaLink="true">${item.link}</guid>
      ${item.enclosures}
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating RSS feed:", error)

    // Fallback RSS (.in domain)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Flavor Studios</title>
    <description>Anime Creation & Stories</description>
    <link>${baseUrl}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new NextResponse(fallbackRss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    })
  }
}
