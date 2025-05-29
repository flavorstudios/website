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
    width?: number
    height?: number
  }
}

export function formatRSSDate(date: string | Date): string {
  const d = new Date(date)
  return d.toUTCString()
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export function truncateDescription(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function generateRSSXML(channel: RSSChannel, items: RSSItem[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>'

  const channelImage = channel.image
    ? `
    <image>
      <url>${escapeXml(channel.image.url)}</url>
      <title>${escapeXml(channel.image.title)}</title>
      <link>${escapeXml(channel.image.link)}</link>
      ${channel.image.width ? `<width>${channel.image.width}</width>` : ""}
      ${channel.image.height ? `<height>${channel.image.height}</height>` : ""}
    </image>`
    : ""

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${item.pubDate}</pubDate>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ""}
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ""}
      ${item.guid ? `<guid isPermaLink="true">${escapeXml(item.guid)}</guid>` : ""}
      ${item.enclosure ? `<enclosure url="${escapeXml(item.enclosure.url)}" type="${item.enclosure.type}" length="${item.enclosure.length}" />` : ""}
    </item>`,
    )
    .join("")

  return `${xmlHeader}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <description>${escapeXml(channel.description)}</description>
    <link>${escapeXml(channel.link)}</link>
    <language>${channel.language}</language>
    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>
    <pubDate>${channel.pubDate}</pubDate>
    <ttl>${channel.ttl}</ttl>
    <atom:link href="${escapeXml(channel.link)}/rss.xml" rel="self" type="application/rss+xml" />
    ${channelImage}
    ${itemsXml}
  </channel>
</rss>`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
