/** @jest-environment node */

import { parseStringPromise } from "xml2js";

import type { PublicPostSummary, PublicVideo } from "@website/shared";
import {
  buildMinimalFeed,
  composeFeedSnapshotFromData,
  getFeedSelfPath,
} from "@/lib/rss-feed-service";

const parserOptions = {
  explicitArray: false,
  attrkey: "$",
  trim: true,
};

function createPost(overrides: Partial<PublicPostSummary> = {}): PublicPostSummary {
  const now = new Date().toISOString();
  return {
    id: "post-1",
    title: "Sample Blog",
    slug: "sample-blog",
    excerpt: "<p>Story about anime production.</p>",
    featuredImage: undefined,
    featured: false,
    author: "Test Author",
    publishedAt: now,
    categories: ["anime", "production"],
    category: "anime",
    commentCount: 0,
    shareCount: 0,
    views: 0,
    readTime: "3 min",
    tags: ["tag-1"],
    ...overrides,
  };
}

function createVideo(overrides: Partial<PublicVideo> = {}): PublicVideo {
  const now = new Date().toISOString();
  return {
    id: "video-1",
    title: "Sample Video",
    slug: "sample-video",
    description: "Trailer description",
    category: "video",
    categories: ["video"],
    tags: ["tag-1"],
    thumbnail: "/thumb.jpg",
    videoUrl: "https://cdn.example.com/video.mp4",
    youtubeId: undefined,
    duration: "1:00",
    featured: false,
    publishedAt: now,
    ...overrides,
  };
}

describe("rss feed service", () => {
  it("builds channel metadata with sorted items", async () => {
    const posts = [
      createPost({ id: "post-1", title: "Older", slug: "older", publishedAt: "2023-01-01T00:00:00Z" }),
      createPost({ id: "post-2", title: "Newer", slug: "newer", publishedAt: "2024-01-01T00:00:00Z" }),
    ];
    const videos = [createVideo({ id: "video-1", slug: "video-one", publishedAt: "2023-06-01T00:00:00Z" })];

    const snapshot = composeFeedSnapshotFromData({ variant: "all", posts, videos });
    const parsed = await parseStringPromise(snapshot.xml, parserOptions);
    const channel = parsed.rss.channel;

    expect(channel.title).toContain("Flavor Studios");
    expect(channel.link).toBe("https://flavorstudios.in");
    expect(channel["atom:link"].$.href).toBe("https://flavorstudios.in/rss.xml");
    expect(channel.docs).toBe("https://validator.w3.org/feed/docs/rss2.html");

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    expect(items).toHaveLength(3);
    const timestamps = items.map((item: any) => new Date(item.pubDate).getTime());
    expect(timestamps[0]).toBeGreaterThan(timestamps[1]);
    expect(items[0]["dc:creator"]).toBeTruthy();
    expect(items[0]["content:encoded"]).toBeTruthy();
    expect(items[0].category).toEqual(expect.arrayContaining(["anime"]));
  });

  it("filters unpublished content and respects variants", async () => {
    const posts = [
      createPost({ id: "p1", slug: "live", publishedAt: "2024-01-02T00:00:00Z" }),
      createPost({ id: "p2", slug: "draft", publishedAt: undefined }),
    ];
    const videos = [
      createVideo({ id: "v1", slug: "public-video", publishedAt: "2024-01-03T00:00:00Z" }),
      createVideo({ id: "v2", slug: "future-video", publishedAt: "2999-01-01T00:00:00Z" }),
    ];

    const snapshot = composeFeedSnapshotFromData({ variant: "blog", posts, videos });
    const parsed = await parseStringPromise(snapshot.xml, parserOptions);
    const channel = parsed.rss.channel;
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];

    expect(items).toHaveLength(1);
    expect(channel.link).toBe("https://flavorstudios.in/blog");
    expect(channel["atom:link"].$.href).toBe("https://flavorstudios.in/rss/blog.xml");
  });

  it("produces valid fallback XML", async () => {
    const fallback = buildMinimalFeed(getFeedSelfPath("videos"), "Video feed fallback");
    const parsed = await parseStringPromise(fallback, parserOptions);
    expect(parsed.rss.channel.link).toBe("https://flavorstudios.in");
    expect(parsed.rss.channel.item).toBeUndefined();
  });
});