// --------- DATA TYPES ---------

import type { Category } from "@/types/category" // <-- Unified type!
import type { PublicBlogSummary } from "@/lib/types"
import { serverEnv } from "@/env/server"
import { SITE_URL } from "@/lib/constants"

const baseUrl = serverEnv.NEXT_PUBLIC_BASE_URL || SITE_URL

export type BlogPost = PublicBlogSummary

export interface Video {
  id: string
  title: string
  slug: string
  description: string
  category: string
  categories?: string[]  // <-- NEW: multi-category support
  tags?: string[]
  publishedAt: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  featured: boolean
}

// --------- CATEGORY FETCH (DEPRECATED: USE /lib/dynamic-categories.ts) ---------

/**
 * @deprecated
 * Use getDynamicCategories from /lib/dynamic-categories.ts for proper separation.
 * This function merges blog and video categories for legacy use only.
 */
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      // API (modern): { blogCategories, videoCategories }
      if ("blogCategories" in data || "videoCategories" in data) {
        const blog = Array.isArray(data.blogCategories) ? data.blogCategories : [];
        const video = Array.isArray(data.videoCategories) ? data.videoCategories : [];
        return [...blog, ...video];
      }
      // API (legacy): flat array
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories:", error);
  }
  return [];
}

// --------- BLOG POSTS FETCH (returns posts with .categories[] and .commentCount) ---------

function normalizeCategories(
  categories: unknown,
  fallback: unknown,
): string[] {
  const normalized = (Array.isArray(categories) ? categories : [])
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  if (typeof fallback === "string") {
    const trimmed = fallback.trim();
    if (trimmed.length > 0) {
      return [trimmed];
    }
  }

  return [];
}

function extractCollection<T>(value: unknown, key: string): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    value &&
    typeof value === "object" &&
    key in value &&
    Array.isArray((value as Record<string, unknown>)[key])
  ) {
    return (value as Record<string, unknown>)[key] as T[];
  }

  return [];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${baseUrl}/api/blogs`, { cache: "no-store" }); // <-- Codex update
    if (response.ok) {
      const posts = await response.json();
      const blogPosts = extractCollection<BlogPost>(posts, "posts");
      // Always expose .categories[] and .commentCount for every post
      return blogPosts.map((post: BlogPost) => ({
        ...post,
        categories: normalizeCategories(post.categories, post.category),
        commentCount: typeof post.commentCount === "number" ? post.commentCount : 0, // <--- Codex!
        shareCount: typeof post.shareCount === "number" ? post.shareCount : 0,
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts:", error);
  }
  return [];
}

// --------- VIDEOS FETCH (returns videos with .categories[]) ---------

export async function getVideos(): Promise<Video[]> {
  try {
    const response = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" }); // <-- Codex update
    if (response.ok) {
      const videos = await response.json();
      const videoItems = extractCollection<Video>(videos, "videos");
      // Always expose .categories[] for every video
      return videoItems.map((video: Video) => ({
        ...video,
        categories: normalizeCategories(video.categories, video.category),
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch videos:", error);
  }
  return [];
}

// --------- DEPRECATED: STATIC CATEGORY FETCH ---------

/**
 * @deprecated
 * Always returns []. Use getDynamicCategories or /lib/dynamic-categories.ts.
 */
export function getStaticCategories(): Category[] {
  return [];
}
