// --------- DATA TYPES ---------

import type { Category } from "@/types/category" // <-- Unified type!

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  categories?: string[]  // <-- NEW: multi-category support
  tags: string[]
  publishedAt: string
  author: string
  featured: boolean
  imageUrl?: string
  commentCount?: number    // <-- Codex: enable comment badge support!
}

export interface Video {
  id: string
  title: string
  slug: string
  description: string
  category: string
  categories?: string[]  // <-- NEW: multi-category support
  tags: string[]
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
    const response = await fetch("/api/categories", { cache: "no-store" });
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

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/api/blogs", { cache: "no-store" }); // <-- Codex update
    if (response.ok) {
      const posts = await response.json();
      // Always expose .categories[] and .commentCount for every post
      return (Array.isArray(posts) ? posts : []).map((post: BlogPost) => ({
        ...post,
        categories: Array.isArray(post.categories) && post.categories.length > 0
          ? post.categories
          : [post.category],
        commentCount: typeof post.commentCount === "number" ? post.commentCount : 0, // <--- Codex!
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
    const response = await fetch("/api/videos", { cache: "no-store" }); // <-- Codex update
    if (response.ok) {
      const videos = await response.json();
      // Always expose .categories[] for every video
      return (Array.isArray(videos) ? videos : []).map((video: Video) => ({
        ...video,
        categories: Array.isArray(video.categories) && video.categories.length > 0
          ? video.categories
          : [video.category],
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
