// /lib/dynamic-categories.ts

import siteData from "@/content-data/categories.json";

// --- Category Data Interface ---
export interface CategoryData {
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  postCount: number;
  tooltip?: string;
  [key: string]: any; // Support for all extra fields (SEO/meta, etc.)
}

// --- Result Type for Dynamic Categories API ---
export interface DynamicCategoriesResult {
  blogCategories: CategoryData[];
  videoCategories: CategoryData[];
}

// --- Utility: Format category list (sort, filter) ---
function format(list: any[]): CategoryData[] {
  return (list || [])
    .filter((c) => c.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// --- Server Helpers ---
export async function getBlogCategories(): Promise<CategoryData[]> {
  return format(siteData.CATEGORIES.blog);
}

export async function getVideoCategories(): Promise<CategoryData[]> {
  return format(siteData.CATEGORIES.watch);
}

// --- Utility: Create slug from category name (keep for use elsewhere) ---
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Utility: Find category by slug ---
export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug);
}

// --- Utility: Format slug back to title-case name ---
export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Consistent, unified category fetcher
 * Always returns { blogCategories, videoCategories }
 * - If type is "blog", videoCategories = []
 * - If type is "video", blogCategories = []
 * - If no type, both populated
 */
export async function getDynamicCategories(
  type?: "blog" | "video"
): Promise<DynamicCategoriesResult> {
  if (type === "blog") {
    const blogCategories = await getBlogCategories();
    return { blogCategories, videoCategories: [] };
  }
  if (type === "video") {
    const videoCategories = await getVideoCategories();
    return { blogCategories: [], videoCategories };
  }
  // Both
  const [blogCategories, videoCategories] = await Promise.all([
    getBlogCategories(),
    getVideoCategories(),
  ]);
  return { blogCategories, videoCategories };
}

/**
 * Helper: Map categories to menu items for navigation
 * @param categories - Array of CategoryData (blog or video)
 * @param baseHref - Root path for this type ('/blog' or '/watch')
 * @param typeLabel - Label for description ('posts' or 'videos')
 * @returns Array of menu items: { label, href, description }
 */
export function mapToMenuItems(
  categories: CategoryData[],
  baseHref: string,
  typeLabel: string
) {
  return categories.map((category) => ({
    label: category.title, // Use title instead of name
    href: `${baseHref}?category=${category.slug}`,
    description: category.tooltip ||
      `${category.title} ${typeLabel}${category.postCount > 0 ? ` (${category.postCount})` : ""}`,
  }));
}

// Aliases for backward compatibility (optional)
export const getDynamicCategoriesClient = getDynamicCategories;
export const getCategoriesWithFallback = getDynamicCategories;
