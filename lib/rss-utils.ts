import fs from "fs";
import path from "path";

// Helper: Detect MIME type from file extension
function getMimeType(url: string): string {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

// Helper: Get byte length of local (public/) or remote file
async function getFileSize(url: string): Promise<string> {
  // Local/public file
  if (url.startsWith("/")) {
    try {
      const filePath = path.join(process.cwd(), "public", url);
      const stat = fs.statSync(filePath);
      return stat.size.toString();
    } catch {
      return "0";
    }
  }
  // Remote file
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok && res.headers.has("content-length")) {
      return res.headers.get("content-length") || "0";
    }
    return "0";
  } catch {
    return "0";
  }
}

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
  webMaster?: string
  managingEditor?: string
  copyright?: string
}

export function formatRSSDate(date: string | Date): string {
  return new Date(date).toUTCString()
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export function truncateDescription(text: string, maxLength = 200): string {
  if (!text) return ""
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
      <category><![CDATA[${item.category || "General"}]]></category>
      <author><![CDATA[${item.author || "Flavor Studios"}]]></author>
      <guid isPermaLink="true">${item.guid || item.link}</guid>${
        item.enclosure
          ? `
      <enclosure url="${item.enclosure.url}" type="${item.enclosure.type}" length="${item.enclosure.length}"/>`
          : ""
      }
    </item>`,
    )
    .join("\n")

  // Normalize trailing slash for atom:link
  const atomLink = channel.link.endsWith("/")
    ? `${channel.link}rss.xml`
    : `${channel.link}/rss.xml`

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
    <atom:link href="${atomLink}" rel="self" type="application/rss+xml"/>
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
    ${
      channel.webMaster
        ? `<webMaster>${channel.webMaster}</webMaster>`
        : ""
    }
    ${
      channel.managingEditor
        ? `<managingEditor>${channel.managingEditor}</managingEditor>`
        : ""
    }
    ${
      channel.copyright
        ? `<copyright>${channel.copyright}</copyright>`
        : ""
    }
    <generator>Flavor Studios RSS Generator</generator>
${xmlItems}
  </channel>
</rss>`
}

export async function generateRssFeed(): Promise<string> {
  try {
    const { blogStore, videoStore } = await import("./content-store")
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

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
      category: post.category || "General",
      author: post.author || "Flavor Studios",
      guid: `${baseUrl}/blog/${post.slug}`,
    }))

    // Convert videos to RSS items (with async enclosure)
    const videoItems: RSSItem[] = await Promise.all(
      videos.map(async (video: any) => {
        let enclosure;
        if (video.thumbnail) {
          const type = getMimeType(video.thumbnail);
          const length = await getFileSize(video.thumbnail);
          enclosure = {
            url: video.thumbnail,
            type,
            length,
          };
        }
        return {
          title: video.title,
          description: truncateDescription(stripHtml(video.description)),
          link: `${baseUrl}/watch/${video.slug || video.id}`,
          pubDate: formatRSSDate(video.publishedAt),
          category: video.category || "General",
          author: "Flavor Studios",
          guid: `${baseUrl}/watch/${video.slug || video.id}`,
          enclosure,
        };
      })
    );

    // Combine and sort all items by publication date
    const allItems = [...blogItems, ...videoItems].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    );

    // Limit to most recent 50 items
    const recentItems = allItems.slice(0, 50);

    // Channel configuration (add/adjust as you wish)
    const channel: RSSChannel = {
      title: "Flavor Studios - Anime Creation Stories",
      description:
        "Behind the scenes of anime creation—one story at a time. Discover exclusive content, industry insights, and creative processes from Flavor Studios.",
      link: baseUrl,
      language: "en-US",
      lastBuildDate: formatRSSDate(new Date()),
      pubDate: recentItems.length > 0 ? recentItems[0].pubDate : formatRSSDate(new Date()),
      ttl: 60,
      image: {
        url: `${baseUrl}/placeholder.png?height=144&width=144&text=Flavor+Studios`,
        title: "Flavor Studios",
        link: baseUrl,
        width: 144,
        height: 144,
      },
      webMaster: "contact@flavorstudios.in (Support)",
      managingEditor: "admin@flavorstudios.in (Admin)",
      copyright: `Copyright ${new Date().getFullYear()} Flavor Studios. All rights reserved.`,
    };

    // Generate RSS XML
    return generateRSSXML(channel, recentItems);
  } catch (error) {
    console.error("Error generating RSS feed:", error);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in";
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
    );
  }
}
