// lib/data.ts

// --------- DATA TYPES ---------

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  author: string
  featured: boolean
  imageUrl?: string
}

export interface Video {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  featured: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count?: number
  type?: string // ("BLOG" | "VIDEO"), if provided by your API
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
    console.warn("Failed to fetch dynamic categories from Prisma:", error);
  }
  return [];
}

// --------- BLOG POSTS FETCH ---------

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/api/blogs", { cache: "no-store" }); // <-- Codex update
    if (response.ok) {
      const posts = await response.json();
      return Array.isArray(posts) ? posts : [];
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts:", error);
  }
  return [];
}

// --------- VIDEOS FETCH ---------

export async function getVideos(): Promise<Video[]> {
  try {
    const response = await fetch("/api/videos", { cache: "no-store" }); // <-- Codex update
    if (response.ok) {
      const videos = await response.json();
      return Array.isArray(videos) ? videos : [];
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
