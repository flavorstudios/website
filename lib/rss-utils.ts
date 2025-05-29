export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  category?: string
  author?: string
  guid: string
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
    width?: number
    height?: number
  }
}

export function generateRSSXML(channel: RSSChannel, items: RSSItem[]): string {
  const xmlItems = items
    .map(
      (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.guid}</guid>
      ${item.category ? `<category><![CDATA[${item.category}]]></category>` : ""}
      ${item.author ? `<author>${item.author}</author>` : ""}
      ${
        item.enclosure
          ? `<enclosure url="${item.enclosure.url}" type="${item.enclosure.type}" length="${item.enclosure.length}" />`
          : ""
      }
    </item>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${channel.title}]]></title>
    <description><![CDATA[${channel.description}]]></description>
    <link>${channel.link}</link>
    <language>${channel.language}</language>
    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>
    <pubDate>${channel.pubDate}</pubDate>
    <ttl>${channel.ttl}</ttl>
    <atom:link href="${channel.link}/rss.xml" rel="self" type="application/rss+xml" />
    ${
      channel.image
        ? `<image>
      <url>${channel.image.url}</url>
      <title><![CDATA[${channel.image.title}]]></title>
      <link>${channel.image.link}</link>
      ${channel.image.width ? `<width>${channel.image.width}</width>` : ""}
      ${channel.image.height ? `<height>${channel.image.height}</height>` : ""}
    </image>`
        : ""
    }
${xmlItems}
  </channel>
</rss>`
}

export function formatRSSDate(date: string | Date): string {
  const d = new Date(date)
  return d.toUTCString()
}

export function truncateDescription(text: string, maxLength = 300): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "..."
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .trim()
}
