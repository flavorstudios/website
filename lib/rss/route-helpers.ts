import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import {
  buildMinimalFeed,
  getFeedSelfPath,
  getRssFeedSnapshot,
  type FeedVariant,
} from "@/lib/rss-feed-service";

const SUCCESS_CACHE_CONTROL = "public, max-age=900, s-maxage=900, stale-while-revalidate=3600";
const FALLBACK_CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=600";

export async function createRssResponse(variant: FeedVariant, fallbackDescription: string) {
  try {
    const snapshot = await getRssFeedSnapshot(variant);
    return respondWithXml(snapshot.xml, snapshot.lastModified, SUCCESS_CACHE_CONTROL, snapshot.itemCount);
  } catch (error) {
    console.error(`[RSS] Failed to render ${variant} feed`, error);
    const fallbackXml = buildMinimalFeed(getFeedSelfPath(variant), fallbackDescription);
    const lastModified = new Date().toUTCString();
    return respondWithXml(fallbackXml, lastModified, FALLBACK_CACHE_CONTROL, 0);
  }
}

function respondWithXml(xml: string, lastModified: string, cacheControl: string, itemCount: number) {
  const etag = createHash("sha256").update(xml).digest("hex");
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": cacheControl,
      "Last-Modified": lastModified,
      ETag: `W/"${etag}"`,
      "X-Feed-Items": String(itemCount),
    },
  });
}