import { FALLBACK_VIDEOS } from "./data/fallback-videos";
import type { PublicVideo, VideoRecord } from "./types";

function normalizeCategories(categories?: unknown, fallback?: unknown): string[] {
  const normalized = Array.isArray(categories)
    ? categories.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  if (normalized.length > 0) {
    return normalized.map((value) => value.trim());
  }
  if (typeof fallback === "string" && fallback.trim().length > 0) {
    return [fallback.trim()];
  }
  return [];
}

function formatVideo(record: VideoRecord): PublicVideo {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description,
    category: record.category ?? normalizeCategories(record.categories)[0] ?? "General",
    categories: normalizeCategories(record.categories, record.category),
    tags: Array.isArray(record.tags) ? record.tags : [],
    thumbnail: record.thumbnail,
    videoUrl: record.videoUrl,
    youtubeId: record.youtubeId,
    duration: record.duration,
    featured: Boolean(record.featured),
    publishedAt: record.publishedAt,
  };
}

export async function getVideos(): Promise<PublicVideo[]> {
  return FALLBACK_VIDEOS.map((video) => formatVideo(video));
}

export async function getVideoBySlug(slug: string): Promise<PublicVideo | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  const match = FALLBACK_VIDEOS.find(
    (video) => video.slug?.toLowerCase() === normalized || video.id === slug,
  );
  return match ? formatVideo(match) : null;
}