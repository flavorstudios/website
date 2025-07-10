// /lib/dynamic-categories.ts

export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// Utility: Create slug from category name
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Utility: Find category by slug
export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug)
}

// Utility: Format slug back to title-case name
export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Canonical: Fetch all blog and video categories from API (unified source of truth)
 * - Fetches from /api/categories which returns { blogCategories, videoCategories }
 * - Returns shape: { blogCategories: CategoryData[], videoCategories: CategoryData[] }
 */
export async function getDynamicCategories(): Promise<DynamicCategoriesResult> {
  try {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const { blogCategories, videoCategories } = await res.json();

    // Defensive: fallback to empty arrays if API misbehaves
    return {
      blogCategories: Array.isArray(blogCategories) ? blogCategories : [],
      videoCategories: Array.isArray(videoCategories) ? videoCategories : [],
    };
  } catch (error) {
    console.warn("Failed to fetch categories from API:", error);
    return {
      blogCategories: [],
      videoCategories: [],
    };
  }
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
    label: category.name,
    href: `${baseHref}?category=${category.slug}`,
    description: `${category.name} ${typeLabel}${category.count > 0 ? ` (${category.count})` : ""}`,
  }));
}

// Aliases for backward compatibility (avoid breaking other imports)
export const getDynamicCategoriesClient = getDynamicCategories
export const getCategoriesWithFallback = getDynamicCategories
