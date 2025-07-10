// lib/data.ts or lib/dynamic-data.ts

// --- DATA TYPES ---

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

// --------- CATEGORY FETCH (UNIFIED & API-DRIVEN) ---------

/**
 * DEPRECATED: Use getDynamicCategories from /lib/dynamic-categories.ts for full category details and separation.
 * This function merges blog and video categories for legacy use only.
 */
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      // If API returns { blogCategories, videoCategories }, merge them.
      if (data.blogCategories || data.videoCategories) {
        const blog = Array.isArray(data.blogCategories) ? data.blogCategories : [];
        const video = Array.isArray(data.videoCategories) ? data.videoCategories : [];
        return [...blog, ...video];
      }
      // If API returns a flat array, return as-is.
      if (Array.isArray(data)) return data;
      return [];
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories from Prisma:", error);
  }
  return [];
}

// --------- BLOG POSTS FETCH (API-DRIVEN) ---------

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/api/admin/blogs", { cache: "no-store" });
    if (response.ok) {
      const posts = await response.json();
      return Array.isArray(posts) ? posts : [];
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts:", error);
  }
  return [];
}

// --------- VIDEOS FETCH (API-DRIVEN) ---------

export async function getVideos(): Promise<Video[]> {
  try {
    const response = await fetch("/api/admin/videos", { cache: "no-store" });
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
 * @deprecated Use getDynamicCategories from /lib/dynamic-categories.ts. Always returns [].
 */
export function getStaticCategories(): Category[] {
  return [];
}
