export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  category?: string
  author?: string
  guid?: string
  enclosure?: {
    url: string
    type: string
    length: string
  }
}

export interface RSSChannel {
  title: string
  description: string
  link: string
  language: string
  lastBuildDate: string
  pubDate: string
  ttl: number
  image?: {
    url: string
    title: string
    link: string
    width: number
    height: number
  }
}

export function formatRSSDate(date: string | Date): string {
  return new Date(date).toUTCString()
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export function truncateDescription(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function generateRSSXML(channel: RSSChannel, items: RSSItem[]): string {
  const xmlItems = items
    .map(
      (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      ${item.category ? `<category><![CDATA[${item.category}]]></category>` : ""}
      ${item.author ? `<author><![CDATA[${item.author}]]></author>` : ""}
      <guid isPermaLink="true">${item.guid || item.link}</guid>
      ${
        item.enclosure
          ? `<enclosure url="${item.enclosure.url}" type="${item.enclosure.type}" length="${item.enclosure.length}"/>`
          : ""
      }
    </item>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${channel.title}]]></title>
    <description><![CDATA[${channel.description}]]></description>
    <link>${channel.link}</link>
    <language>${channel.language}</language>
    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>
    <pubDate>${channel.pubDate}</pubDate>
    <ttl>${channel.ttl}</ttl>
    <atom:link href="${channel.link}/rss.xml" rel="self" type="application/rss+xml"/>
    ${
      channel.image
        ? `<image>
      <url>${channel.image.url}</url>
      <title><![CDATA[${channel.image.title}]]></title>
      <link>${channel.image.link}</link>
      <width>${channel.image.width}</width>
      <height>${channel.image.height}</height>
    </image>`
        : ""
    }
${xmlItems}
  </channel>
</rss>`
}

export async function generateRssFeed(): Promise<string> {
  try {
    const { blogStore, videoStore } = await import("./content-store")
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"

    // Fetch published content
    const [blogPosts, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Convert blog posts to RSS items
    const blogItems: RSSItem[] = blogPosts.map((post: any) => ({
      title: post.title,
      description: truncateDescription(stripHtml(post.excerpt || post.content)),
      link: `${baseUrl}/blog/${post.slug}`,
      pubDate: formatRSSDate(post.publishedAt),
      category: post.category,
      author: post.author || "Flavor Studios",
      guid: `${baseUrl}/blog/${post.slug}`,
    }))

    // Convert videos to RSS items
    const videoItems: RSSItem[] = videos.map((video: any) => ({
      title: video.title,
      description: truncateDescription(stripHtml(video.description)),
      link: `${baseUrl}/watch/${video.slug || video.id}`,
      pubDate: formatRSSDate(video.publishedAt),
      category: video.category,
      author: "Flavor Studios",
      guid: `${baseUrl}/watch/${video.slug || video.id}`,
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
        url: `${baseUrl}/placeholder.svg?height=144&width=144&text=Flavor+Studios`,
        title: "Flavor Studios",
        link: baseUrl,
        width: 144,
        height: 144,
      },
    }

    // Generate RSS XML
    return generateRSSXML(channel, recentItems)
  } catch (error) {
    console.error("Error generating RSS feed:", error)

    // Return minimal RSS feed on error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"
    return generateRSSXML(
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
  }
}
