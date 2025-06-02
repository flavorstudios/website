/*
======================
Tiny Pro Tips for Polish
======================

1. Always provide at least one <enclosure> for images (RSS readers love it for previews and thumbnails).

2. If you start a podcast, add `audioUrl` to your blogs/videos—your RSS feed will be instantly podcast-ready for Apple, Spotify, etc.

3. For video:
   - Set `videoUrl` to a direct MP4 link for true video podcast support (works in all podcast and news readers).
   - Optionally add `youtubeUrl` for broader feed discovery (better for regular RSS readers, less so for podcast apps).

4. Add multiple categories/tags for better discoverability in all RSS and news apps.

5. Remember: Thumbnails/cover images make your posts stand out everywhere. Never ship a post without a preview image!
*/

export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  category?: string | string[]
  author?: string
  guid?: string
  enclosure?: {
    url: string
    type: string
    length: string
  }
  enclosures?: {
    url: string
    type: string
    length?: string
  }[]
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

// Util: Proper RSS date
export function formatRSSDate(date: string | Date): string {
  return new Date(date).toUTCString()
}

// Util: Strip HTML for clean descriptions
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

// Util: Limit description length
export function truncateDescription(text: string, maxLength = 200): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

// XML attribute escape for enclosure URLs, etc.
function escapeAttr(unsafe: string) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function generateRSSXML(channel: RSSChannel, items: RSSItem[]): string {
  const xmlItems = items
    .map(
      (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      ${Array.isArray(item.category)
        ? item.category.map((cat: string) => `<category><![CDATA[${cat}]]></category>`).join("")
        : item.category
        ? `<category><![CDATA[${item.category}]]></category>`
        : ""}
      ${item.author ? `<author><![CDATA[${item.author}]]></author>` : ""}
      ${item.author ? `<dc:creator><![CDATA[${item.author}]]></dc:creator>` : ""}
      <guid isPermaLink="true">${item.guid || item.link}</guid>
      ${
        item.enclosure
          ? `<enclosure url="${escapeAttr(item.enclosure.url)}" type="${item.enclosure.type}" length="${item.enclosure.length}"/>`
          : ""
      }
      ${
        Array.isArray(item.enclosures)
          ? item.enclosures
              .map(
                (enc) =>
                  `<enclosure url="${escapeAttr(enc.url)}" type="${enc.type}" length="${enc.length || "0"}"/>`
              )
              .join("\n")
          : ""
      }
    </item>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
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

// MAIN GENERATOR FUNCTION: Use this to create your feed
export async function generateRssFeed(): Promise<string> {
  try {
    const { blogStore, videoStore } = await import("./content-store")
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

    // Fetch published blogs and videos
    const [blogPosts, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Build blog RSS items (with multi-tags/enclosures!)
    const blogItems: RSSItem[] = blogPosts.map((post: any) => ({
      title: post.title,
      description: truncateDescription(stripHtml(post.seoDescription || post.excerpt || post.content || "")),
      link: `${baseUrl}/blog/${post.slug}`,
      pubDate: formatRSSDate(post.publishedAt),
      category: Array.isArray(post.tags)
        ? post.tags
        : post.category
        ? [post.category]
        : [],
      author: post.author || "Flavor Studios",
      guid: `${baseUrl}/blog/${post.slug}`,
      // ALL enclosures: images, audio
      enclosures: [
        post.thumbnail
          ? { url: post.thumbnail, type: "image/jpeg", length: "0" }
          : null,
        post.audioUrl
          ? { url: post.audioUrl, type: "audio/mpeg", length: "0" }
          : null,
      ].filter(Boolean),
    }))

    // Build video RSS items (with images, audio, video enclosures)
    const videoItems: RSSItem[] = videos.map((video: any) => ({
      title: video.title,
      description: truncateDescription(stripHtml(video.description || "")),
      link: `${baseUrl}/watch/${video.slug || video.id}`,
      pubDate: formatRSSDate(video.publishedAt),
      category: Array.isArray(video.tags)
        ? video.tags
        : video.category
        ? [video.category]
        : [],
      author: "Flavor Studios",
      guid: `${baseUrl}/watch/${video.slug || video.id}`,
      enclosures: [
        video.thumbnail
          ? { url: video.thumbnail, type: "image/jpeg", length: "0" }
          : null,
        video.audioUrl
          ? { url: video.audioUrl, type: "audio/mpeg", length: "0" }
          : null,
        video.videoUrl
          ? { url: video.videoUrl, type: "video/mp4", length: "0" }
          : null,
        video.youtubeUrl
          ? { url: video.youtubeUrl, type: "video/*", length: "0" }
          : null,
      ].filter(Boolean),
    }))

    // Sort, merge, and limit items
    const allItems = [...blogItems, ...videoItems].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    )
    const recentItems = allItems.slice(0, 50)

    // Feed/channel metadata
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

    return generateRSSXML(channel, recentItems)
  } catch (error) {
    console.error("Error generating RSS feed:", error)

    // Fallback minimal RSS
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"
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
