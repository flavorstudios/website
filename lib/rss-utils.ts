import { DOCS_URL } from "@/lib/constants";

export interface RssImage {
  url: string;
  title: string;
  link: string;
  width?: number;
  height?: number;
}

export interface RssChannel {
  title: string;
  description: string;
  link: string;
  selfUrl: string;
  language?: string;
  lastBuildDate: string;
  pubDate: string;
  ttl?: number;
  docsUrl?: string;
  generator?: string;
  webMaster?: string;
  managingEditor?: string;
  copyright?: string;
  image?: RssImage;
}

export interface RssEnclosure {
  url: string;
  type: string;
  length?: number | string;
}

export interface RssItem {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  description: string;
  contentHtml?: string;
  creator?: string;
  categories?: string[];
  enclosure?: RssEnclosure;
}

export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function truncateDescription(text?: string | null, maxLength = 280): string {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text.trim();
  }
  return `${text.slice(0, maxLength).trim()}…`;
}

export function escapeCdata(value: string): string {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

export function wrapCdata(value?: string | null): string {
  const safe = typeof value === "string" ? value : "";
  return `<![CDATA[${escapeCdata(safe)}]]>`;
}

export function formatRssDate(input?: string | number | Date | null): string {
  const date = input instanceof Date ? input : new Date(input ?? Date.now());
  if (Number.isNaN(date.getTime())) {
    return new Date().toUTCString();
  }
  return date.toUTCString();
}

export function buildRssXmlDocument(channel: RssChannel, items: RssItem[]): string {
  const docs = channel.docsUrl ?? DOCS_URL;
  const generator = channel.generator ?? "Next.js RSS Generator";
  const channelImage = channel.image
    ? `    <image>
      <url>${channel.image.url}</url>
      <title>${wrapCdata(channel.image.title)}</title>
      <link>${channel.image.link}</link>
      ${channel.image.width ? `<width>${channel.image.width}</width>` : ""}
      ${channel.image.height ? `<height>${channel.image.height}</height>` : ""}
    </image>`
    : "";

    const xmlItems = items
      .map((item) => {
        const categoryBlock = (item.categories ?? [])
          .filter((category) => Boolean(category && category.trim()))
          .map((category) => `      <category>${wrapCdata(category.trim())}</category>`)
          .join("\n");

      const enclosure = item.enclosure
        ? `      <enclosure url="${item.enclosure.url}" type="${item.enclosure.type}"${
            item.enclosure.length ? ` length="${item.enclosure.length}"` : ""
          } />`
        : "";

      const creator = item.creator ? `      <dc:creator>${wrapCdata(item.creator)}</dc:creator>` : "";
      const content = item.contentHtml
        ? `      <content:encoded>${wrapCdata(item.contentHtml)}</content:encoded>`
        : "";

        const optionalSegments = [creator, categoryBlock, content, enclosure]
          .filter((segment) => Boolean(segment && segment.trim().length > 0))
          .join("\n");
        const optionalBlock = optionalSegments ? `\n${optionalSegments}` : "";

        return `    <item>
      <title>${wrapCdata(item.title)}</title>
      <description>${wrapCdata(item.description)}</description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>${optionalBlock}
    </item>`;
      })
      .join("\n");

  const channelOptional = [channel.ttl ? `<ttl>${channel.ttl}</ttl>` : "", channelImage]
      .filter((segment) => Boolean(segment && segment.trim().length > 0))
      .join("\n");
    const channelOptionalBlock = channelOptional ? `\n    ${channelOptional}` : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${wrapCdata(channel.title)}</title>
    <description>${wrapCdata(channel.description)}</description>
    <link>${channel.link}</link>
    <language>${channel.language ?? "en-US"}</language>
    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>
    <pubDate>${channel.pubDate}</pubDate>${channelOptionalBlock}
    <docs>${docs}</docs>
    <generator>${wrapCdata(generator)}</generator>
    <atom:link href="${channel.selfUrl}" rel="self" type="application/rss+xml" />
    ${channel.webMaster ? `<webMaster>${channel.webMaster}</webMaster>` : ""}
    ${channel.managingEditor ? `<managingEditor>${channel.managingEditor}</managingEditor>` : ""}
    ${channel.copyright ? `<copyright>${channel.copyright}</copyright>` : ""}
${xmlItems}
  </channel>
</rss>`;
  }

export function buildMinimalFeedXml(options: {
  title: string;
  description: string;
  link: string;
  selfUrl: string;
  language?: string;
  docsUrl?: string;
  generator?: string;
}): string {
  const now = formatRssDate(new Date());
  return buildRssXmlDocument(
    {
      title: options.title,
      description: options.description,
      link: options.link,
      selfUrl: options.selfUrl,
      language: options.language,
      docsUrl: options.docsUrl,
      generator: options.generator,
      lastBuildDate: now,
      pubDate: now,
      ttl: 30,
    },
    [],
  );
}

