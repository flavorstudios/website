import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"
import {
  generateRSSXML,
  formatRSSDate,
  truncateDescription,
  stripHtml,
  type RSSItem,
  type RSSChannel,
} from "@/lib/rss-utils"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"

    // Fetch published content
    const [blogPosts, videos] = await Promise.all([blogStore.getPublished(), videoStore.getPublished()])

    // Convert blog posts to RSS items
    const blogItems: RSSItem[] = blogPosts.map((post) => ({
      title: post.title,
      description: truncateDescription(stripHtml(post.excerpt || post.content)),
      link: `${baseUrl}/blog/${post.slug}`,
      pubDate: formatRSSDate(post.publishedAt),
      category: post.category,
      author: post.author || "Flavor Studios",
      guid: `${baseUrl}/blog/${post.slug}`,
    }))

    // Convert videos to RSS items
    const videoItems: RSSItem[] = videos.map((video) => ({
      title: video.title,
      description: truncateDescription(stripHtml(video.description)),
      link: `${baseUrl}/watch/${video.id}`,
      pubDate: formatRSSDate(video.publishedAt),
      category: video.category,
      author: "Flavor Studios",
      guid: `${baseUrl}/watch/${video.id}`,
      enclosure: video.thumbnail
        ? {
            url: video.thumbnail,
            type: "image/jpeg",
            length: "0",
          }
        : undefined,
    }))

    // Combine and sort all items by publication date
    const allItems = [...blogItems, ...videoItems].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    )

    // Limit to most recent 50 items
    const recentItems = allItems.slice(0, 50)

    // Channel configuration
    const channel: RSSChannel = {
      title: "Flavor Studios - Anime Creation Stories",
      description:
        "Behind the scenes of anime creation—one story at a time. Discover exclusive content, industry insights, and creative processes from Flavor Studios.",
      link: baseUrl,
      language: "en-US",
      lastBuildDate: formatRSSDate(new Date()),
      pubDate: recentItems.length > 0 ? recentItems[0].pubDate : formatRSSDate(new Date()),
      ttl: 60, // 1 hour
      image: {
        url: `${baseUrl}/images/logo.png`,
        title: "Flavor Studios",
        link: baseUrl,
        width: 144,
        height: 144,
      },
    }

    // Generate RSS XML
    const rssXml = generateRSSXML(channel, recentItems)

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
        "CDN-Cache-Control": "public, max-age=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error generating RSS feed:", error)

    // Return minimal RSS feed on error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"
    const errorRss = generateRSSXML(
      {
        title: "Flavor Studios",
        description: "Anime creation stories and insights",
        link: baseUrl,
        language: "en-US",
        lastBuildDate: formatRSSDate(new Date()),
        pubDate: formatRSSDate(new Date()),
        ttl: 60,
      },
      [],
    )

    return new NextResponse(errorRss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300", // Shorter cache on error
      },
    })
  }
}
