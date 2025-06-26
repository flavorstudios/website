// lib/rss-utils.ts

import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { getCanonicalUrl } from "@/lib/seo-utils";
import fs from "fs";
import path from "path";

// Detects MIME type from file extension
function getMimeType(url: string): string {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

// Gets byte length for local (public/) files; undefined for remote
async function getFileSize(url: string): Promise<string | undefined> {
  if (url.startsWith("/")) {
    try {
      const filePath = path.join(process.cwd(), "public", url);
      const stat = await fs.promises.stat(filePath);
      return stat.size.toString();
    } catch (error) {
      console.warn(`Could not get file size for local asset: ${url}. Error: ${error}`);
      return undefined;
    }
  }
  return undefined;
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
  author?: string;
  guid?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: string;
  };
}

export interface RSSChannel {
  title: string;
  description: string;
  link: string;
  language: string;
  lastBuildDate: string;
  pubDate: string;
  ttl: number;
  image?: {
    url: string;
    title: string;
    link: string;
    width: number;
    height: number;
  };
  webMaster?: string;
  managingEditor?: string;
  copyright?: string;
}

export function formatRSSDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn(`Invalid date for RSS formatting: ${date}. Returning now.`);
    return new Date().toUTCString();
  }
  return d.toUTCString();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function truncateDescription(text: string, maxLength = 200): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

// RSS 2.0 XML builder (SEO-friendly, always canonical URLs)
export function generateRSSXML(channel: RSSChannel, items: RSSItem[]): string {
  const xmlItems = items
    .map(
      (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      <category><![CDATA[${item.category || "General"}]]></category>
      <author><![CDATA[${item.author || SITE_NAME}]]></author>
      <guid isPermaLink="true">${item.guid || item.link}</guid>${
        item.enclosure
          ? `
      <enclosure url="${item.enclosure.url}" type="${item.enclosure.type}"${
              item.enclosure.length ? ` length="${item.enclosure.length}"` : ""
            }/>`
          : ""
      }
    </item>`
    )
    .join("\n");

  // Atom-compliant, canonicalized self-link
  const atomLinkHref = getCanonicalUrl("/rss.xml");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${channel.title}]]></title>
    <description><![CDATA[${channel.description}]]></description>
    <link>${getCanonicalUrl("/")}</link>
    <language>${channel.language}</language>
    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>
    <pubDate>${channel.pubDate}</pubDate>
    <ttl>${channel.ttl}</ttl>
    <atom:link href="${atomLinkHref}" rel="self" type="application/rss+xml"/>
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
    ${channel.webMaster ? `<webMaster>${channel.webMaster}</webMaster>` : ""}
    ${channel.managingEditor ? `<managingEditor>${channel.managingEditor}</managingEditor>` : ""}
    ${channel.copyright ? `<copyright>${channel.copyright}</copyright>` : ""}
    <generator>${SITE_NAME} RSS Generator</generator>
${xmlItems}
  </channel>
</rss>`;
}

// Main generator: always canonicalizes links, ready for SEO/schema injection if needed
export async function generateRssFeed(): Promise<string> {
  try {
    const { blogStore, videoStore } = await import("./content-store");

    // Fetch concurrently for best performance
    const [blogPosts, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ]);

    // Blogs (always canonical URLs)
    const blogItems: RSSItem[] = blogPosts.map((post: any) => ({
      title: post.title,
      description: truncateDescription(stripHtml(post.excerpt || post.content)),
      link: getCanonicalUrl(`/blog/${post.slug}`),
      pubDate: formatRSSDate(post.publishedAt),
      category: post.category || "General",
      author: post.author || SITE_NAME,
      guid: getCanonicalUrl(`/blog/${post.slug}`),
    }));

    // Videos (with thumbnail enclosure, canonical URLs)
    const videoItems: RSSItem[] = await Promise.all(
      videos.map(async (video: any) => {
        let enclosure;
        if (video.thumbnail) {
          const type = getMimeType(video.thumbnail);
          const length = await getFileSize(video.thumbnail);
          enclosure = {
            url: video.thumbnail.startsWith("http")
              ? video.thumbnail
              : getCanonicalUrl(video.thumbnail),
            type,
            ...(length ? { length } : {}),
          };
        }
        return {
          title: video.title,
          description: truncateDescription(stripHtml(video.description)),
          link: getCanonicalUrl(`/watch/${video.slug || video.id}`),
          pubDate: formatRSSDate(video.publishedAt),
          category: video.category || "General",
          author: SITE_NAME,
          guid: getCanonicalUrl(`/watch/${video.slug || video.id}`),
          enclosure,
        };
      })
    );

    // Sort newest first, limit to 50
    const allItems = [...blogItems, ...videoItems].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    const recentItems = allItems.slice(0, 50);

    // Channel block (all canonical)
    const channel: RSSChannel = {
      title: `${SITE_NAME} | Anime News, Original Stories & Creative Insights`,
      description: `Step behind the scenes with ${SITE_NAME}, your gateway to anime news, original stories, and the creative journey of anime production. Explore exclusive episodes, in-depth industry insights, and the artistry behind every animation.`,
      link: getCanonicalUrl("/"),
      language: "en-US",
      lastBuildDate: formatRSSDate(new Date()),
      pubDate: recentItems.length > 0 ? recentItems[0].pubDate : formatRSSDate(new Date()),
      ttl: 60,
      image: {
        url: getCanonicalUrl("/placeholder.png"),
        title: SITE_NAME,
        link: getCanonicalUrl("/"),
        width: 144,
        height: 144,
      },
      webMaster: "contact@flavorstudios.in (Support)",
      managingEditor: "admin@flavorstudios.in (Admin)",
      copyright: `Copyright ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`,
    };

    return generateRSSXML(channel, recentItems);
  } catch (error) {
    console.error("Error generating RSS feed:", error);

    // Fallback: minimal feed with canonical home URL
    return generateRSSXML(
      {
        title: SITE_NAME,
        description: "Anime creation stories and insights",
        link: getCanonicalUrl("/"),
        language: "en-US",
        lastBuildDate: formatRSSDate(new Date()),
        pubDate: formatRSSDate(new Date()),
        ttl: 60,
      },
      [],
    );
  }
}
