import { Buffer } from "node:buffer";
import { unstable_cache, revalidateTag } from "next/cache";
import type { PublicPostSummary, PublicVideo } from "@website/shared";

import { buildExternalApiUrl } from "@/lib/api/external";
import { SITE_DESCRIPTION, SITE_LOGO_URL, SITE_NAME, SUPPORT_EMAIL } from "@/lib/constants";
import { getCanonicalUrl } from "@/lib/seo-utils";
import {
  buildMinimalFeedXml,
  buildRssXmlDocument,
  formatRssDate,
  stripHtml,
  truncateDescription,
  type RssItem,
} from "@/lib/rss-utils";
import { serverEnv } from "@/env/server";

const FEED_CACHE_TAG = "rss-feed";
const FEED_REVALIDATE_SECONDS = 1800;
const FEED_ITEM_LIMIT = 50;
const FEED_VARIANTS = ["all", "blog", "videos"] as const;

export type FeedVariant = (typeof FEED_VARIANTS)[number];

interface FeedContent {
  posts: PublicPostSummary[];
  videos: PublicVideo[];
}

interface FeedVariantConfig {
  variant: FeedVariant;
  title: string;
  description: string;
  channelPath: string;
  selfPath: string;
}

export interface FeedSnapshot {
  variant: FeedVariant;
  xml: string;
  lastModified: string;
  itemCount: number;
  byteLength: number;
  selfPath: string;
}

const feedSnapshotCache: Record<FeedVariant, () => Promise<FeedSnapshot>> = FEED_VARIANTS.reduce(
  (acc, variant) => {
    acc[variant] = unstable_cache(
      async (): Promise<FeedSnapshot> => {
        const content = await fetchFeedContent(variant);
        return composeFeedSnapshotFromData({ variant, ...content });
      },
      ["rss-feed", variant],
      { tags: [FEED_CACHE_TAG], revalidate: FEED_REVALIDATE_SECONDS },
    );
    return acc;
  },
  {} as Record<FeedVariant, () => Promise<FeedSnapshot>>,
);

export async function getRssFeedSnapshot(variant: FeedVariant = "all"): Promise<FeedSnapshot> {
  return feedSnapshotCache[variant]();
}

export async function warmFeedCache(variant: FeedVariant): Promise<FeedSnapshot> {
  return feedSnapshotCache[variant]();
}

export function getFeedVariants(): FeedVariant[] {
  return [...FEED_VARIANTS];
}

export function getFeedSelfPath(variant: FeedVariant): string {
  return getVariantConfig(variant).selfPath;
}

export async function revalidateRssFeeds(): Promise<void> {
  revalidateTag(FEED_CACHE_TAG);
}

export function composeFeedSnapshotFromData({
  variant,
  posts,
  videos,
}: FeedContent & { variant: FeedVariant }): FeedSnapshot {
  const config = getVariantConfig(variant);
  const includePosts = variant !== "videos";
  const includeVideos = variant !== "blog";

  const candidates: { item: RssItem; timestamp: number }[] = [];

  if (includePosts) {
    for (const post of filterPublished(posts)) {
      const item = mapPostToFeedItem(post);
      if (!item) continue;
      candidates.push({ item, timestamp: new Date(post.publishedAt ?? Date.now()).getTime() });
    }
  }

  if (includeVideos) {
    for (const video of filterPublished(videos)) {
      const item = mapVideoToFeedItem(video);
      if (!item) continue;
      candidates.push({ item, timestamp: new Date(video.publishedAt ?? Date.now()).getTime() });
    }
  }

  const sortedItems = candidates
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, FEED_ITEM_LIMIT);

  const rssItems = sortedItems.map((entry) => entry.item);
  const latestTimestamp = sortedItems[0]?.timestamp ?? Date.now();
  const lastModified = formatRssDate(new Date(latestTimestamp));

  const channelLink = getCanonicalUrl(config.channelPath);
  const selfUrl = getCanonicalUrl(config.selfPath);
  const xml = buildRssXmlDocument(
    {
      title: config.title,
      description: config.description,
      link: channelLink,
      selfUrl,
      language: "en-US",
      lastBuildDate: lastModified,
      pubDate: rssItems[0]?.pubDate ?? lastModified,
      ttl: 60,
      docsUrl: "https://validator.w3.org/feed/docs/rss2.html",
      generator: `${SITE_NAME} RSS Service`,
      webMaster: getRssAdminContact(),
      managingEditor: getRssManagingEditor(),
      copyright: `Copyright ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`,
      image: {
        url: SITE_LOGO_URL,
        title: SITE_NAME,
        link: channelLink,
        width: 512,
        height: 512,
      },
    },
    rssItems,
  );

  return {
    variant,
    xml,
    lastModified,
    itemCount: rssItems.length,
    byteLength: Buffer.byteLength(xml, "utf8"),
    selfPath: config.selfPath,
  };
}

async function fetchFeedContent(variant: FeedVariant): Promise<FeedContent> {
  const includePosts = variant !== "videos";
  const includeVideos = variant !== "blog";
  const [posts, videos] = await Promise.all([
    includePosts ? fetchPosts() : Promise.resolve<PublicPostSummary[]>([]),
    includeVideos ? fetchVideos() : Promise.resolve<PublicVideo[]>([]),
  ]);

  return { posts, videos };
}

async function fetchPosts(): Promise<PublicPostSummary[]> {
  const url = buildExternalApiUrl("/posts");
  try {
    const response = await fetch(url, {
      next: { revalidate: FEED_REVALIDATE_SECONDS, tags: [FEED_CACHE_TAG, "posts"] },
    });
    if (!response.ok) {
      console.error(`[RSS] Failed to fetch posts: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as PublicPostSummary[]) : [];
  } catch (error) {
    console.error("[RSS] Error fetching posts", error);
    return [];
  }
}

async function fetchVideos(): Promise<PublicVideo[]> {
  const url = buildExternalApiUrl("/videos");
  try {
    const response = await fetch(url, {
      next: { revalidate: FEED_REVALIDATE_SECONDS, tags: [FEED_CACHE_TAG, "videos"] },
    });
    if (!response.ok) {
      console.error(`[RSS] Failed to fetch videos: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as PublicVideo[]) : [];
  } catch (error) {
    console.error("[RSS] Error fetching videos", error);
    return [];
  }
}

function filterPublished<T extends { publishedAt?: string | null }>(items: T[]): T[] {
  const now = Date.now();
  return items.filter((item) => {
    if (!item.publishedAt) return false;
    const timestamp = new Date(item.publishedAt).getTime();
    if (Number.isNaN(timestamp)) return false;
    return timestamp <= now;
  });
}

function mapPostToFeedItem(post: PublicPostSummary): RssItem | null {
  if (!post.slug) return null;
  const link = getCanonicalUrl(`/blog/${post.slug}`);
  const descriptionSource = truncateDescription(stripHtml(post.excerpt ?? post.title ?? ""), 260);
  const categories = normalizeCategories(post.categories, post.category);

  return {
    title: post.title,
    link,
    guid: link,
    pubDate: formatRssDate(post.publishedAt),
    description: descriptionSource || SITE_DESCRIPTION,
    contentHtml: post.excerpt,
    creator: post.author ?? SITE_NAME,
    categories,
  };
}

function mapVideoToFeedItem(video: PublicVideo): RssItem | null {
  if (!video.slug) return null;
  const link = getCanonicalUrl(`/watch/${video.slug}`);
  const description = truncateDescription(stripHtml(video.description ?? video.title ?? ""), 260);
  const categories = normalizeCategories(video.categories, video.category);
  const enclosure = buildVideoEnclosure(video);

  return {
    title: video.title,
    link,
    guid: link,
    pubDate: formatRssDate(video.publishedAt),
    description: description || SITE_DESCRIPTION,
    contentHtml: video.description,
    creator: SITE_NAME,
    categories,
    enclosure,
  };
}

function normalizeCategories(list?: string[] | null, fallback?: string | null): string[] {
  const categories = Array.isArray(list) ? list : [];
  const normalized = categories
    .concat(fallback ? [fallback] : [])
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());
  return Array.from(new Set(normalized));
}

function buildVideoEnclosure(video: PublicVideo) {
  const source = video.videoUrl || video.thumbnail;
  if (!source) return undefined;
  const url = ensureAbsoluteUrl(source);
  return {
    url,
    type: getMimeType(url),
  };
}

function ensureAbsoluteUrl(url: string): string {
  if (!url) return getCanonicalUrl("/");
  return url.startsWith("http") ? url : getCanonicalUrl(url);
}

function getMimeType(url: string): string {
  const normalized = url.toLowerCase();
  if (normalized.endsWith(".mp4")) return "video/mp4";
  if (normalized.endsWith(".webm")) return "video/webm";
  if (normalized.endsWith(".mp3")) return "audio/mpeg";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

function getVariantConfig(variant: FeedVariant): FeedVariantConfig {
  switch (variant) {
    case "blog":
      return {
        variant,
        title: `${SITE_NAME} Blog`,
        description: `${SITE_NAME} blog updates, production notes, and behind-the-scenes articles.`,
        channelPath: "/blog",
        selfPath: "/rss/blog.xml",
      };
    case "videos":
      return {
        variant,
        title: `${SITE_NAME} Videos`,
        description: `${SITE_NAME} video premieres, trailers, and creator commentary in one feed.`,
        channelPath: "/videos",
        selfPath: "/rss/videos.xml",
      };
    default:
      return {
        variant: "all",
        title: `${SITE_NAME} Feed`,
        description: `${SITE_NAME} stories, news, and videos in a single stream.`,
        channelPath: "/",
        selfPath: "/rss.xml",
      };
  }
}

function getRssAdminContact(): string {
  return (
    serverEnv.RSS_ADMIN_CONTACT ||
    serverEnv.ADMIN_EMAIL ||
    serverEnv.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    SUPPORT_EMAIL
  );
}

function getRssManagingEditor(): string {
  return (
    serverEnv.RSS_MANAGING_EDITOR ||
    serverEnv.ADMIN_EMAIL ||
    serverEnv.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    SUPPORT_EMAIL
  );
}

export function buildMinimalFeed(selfPath: string, description: string) {
  return buildMinimalFeedXml({
    title: SITE_NAME,
    description,
    link: getCanonicalUrl("/"),
    selfUrl: getCanonicalUrl(selfPath),
    generator: `${SITE_NAME} RSS Service`,
    language: "en-US",
  });
}