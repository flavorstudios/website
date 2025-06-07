import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"

export async function GET() {
  try {
    // Always use .in domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

    // Fetch latest blogs and videos
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Combine, tag, and sort all items
    const allContent = [
      ...blogs.map((blog: any) => ({
        title: blog.title,
        description: blog.excerpt || blog.seoDescription || "",
        link: `${baseUrl}/blog/${blog.slug}`,
        pubDate: new Date(blog.publishedAt).toUTCString(),
        category: blog.category || "General",
        author: blog.author || "Flavor Studios",
        type: "blog",
      })),
      ...videos.map((video: any) => ({
        title: video.title,
        description: video.description || "",
        link: `${baseUrl}/watch/${video.slug || video.id}`,
        pubDate: new Date(video.publishedAt).toUTCString(),
        category: video.category || "General",
        author: "Flavor Studios",
        type: "video",
      })),
    ]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 50) // 50 most recent

    // RSS XML structure
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flavor Studios - Anime Creation & Stories</title>
    <description>Latest anime episodes, behind-the-scenes content, and creative insights from Flavor Studios.</description>
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
    <generator>Flavor Studios RSS Generator</generator>
    <ttl>60</ttl>
${allContent
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      <category><![CDATA[${item.category}]]></category>
      <author><![CDATA[${item.author}]]></author>
      <guid isPermaLink="true">${item.link}</guid>
    </item>`,
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
    // Fallback with minimal valid RSS
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
