// lib/categories.ts

// --------- CATEGORY TYPE ---------
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count?: number
  type?: string // Optional: for future filtering ("BLOG" | "VIDEO")
}

// --------- CATEGORY FETCH (DEPRECATED, MERGES BLOG & VIDEO) ---------

/**
 * @deprecated
 * Use /lib/dynamic-categories.ts for blog/video separation.
 * This legacy function merges blog and video categories if API returns them separately.
 */
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();

      // If API returns a flat array (legacy)
      if (Array.isArray(data)) return data;

      // If API returns { blogCategories, videoCategories }
      if ("blogCategories" in data || "videoCategories" in data) {
        const blog = Array.isArray(data.blogCategories) ? data.blogCategories : [];
        const video = Array.isArray(data.videoCategories) ? data.videoCategories : [];
        return [...blog, ...video];
      }

      // Edge case: fallback
      return [];
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories from Prisma:", error);
  }
  // No fallback: return empty array if fetch fails
  return [];
}

// --------- DEPRECATED: STATIC CATEGORY FETCH ---------

/**
 * @deprecated
 * Always returns []. Migrate to dynamic category fetch.
 */
export function getStaticCategories(): Category[] {
  return [];
}
